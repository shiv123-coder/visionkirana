import pytesseract
from pytesseract import Output
import fitz  # PyMuPDF
import cv2
import numpy as np
import re
import logging
from datetime import datetime
from typing import Dict, Any, List
from fastapi import UploadFile

logger = logging.getLogger(__name__)

class OCRProcessor:
    def __init__(self):
        # Tesseract is stateless, no heavy initialization needed
        pass
        
        self.date_pattern = re.compile(r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b')
        # Matches numbers like 1,000.00, 1000.00, $500, Rs. 500
        self.amount_pattern = re.compile(r'(?:Rs\.?|INR|\$)?\s*\b(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\b', re.IGNORECASE)

    def _convert_pdf_to_images(self, pdf_bytes: bytes):
        """Converts first page of PDF to an OpenCV image."""
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            if len(doc) == 0:
                return []
            
            # Just take the first page for standard invoice processing
            page = doc.load_page(0)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # 2x zoom for better OCR
            
            # Convert to numpy array (RGB)
            img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
            
            # Convert RGB to BGR for OpenCV consistency if needed, but EasyOCR handles RGB fine
            if pix.n == 4:
                img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
            elif pix.n == 3:
                img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                
            return [img]
        except Exception as e:
            logger.error(f"Error converting PDF: {e}")
            return []

    def _convert_bytes_to_image(self, img_bytes: bytes):
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img

    def _extract_amounts(self, text: str) -> list[float]:
        amounts = []
        matches = self.amount_pattern.findall(text)
        for match in matches:
            try:
                # Remove commas
                clean_val = match.replace(',', '')
                val = float(clean_val)
                if val > 0: # ignore 0 amounts usually
                    amounts.append(val)
            except ValueError:
                continue
        return sorted(amounts, reverse=True)

    def _extract_supplier_name(self, results) -> str:
        # Heuristic: Supplier name is often near the top, large font, or first few lines.
        # results format: (bbox, text, prob)
        if not results:
            return None
            
        # Sort by Y coordinate (top to bottom)
        sorted_by_y = sorted(results, key=lambda r: min(p[1] for p in r[0]))
        
        # Look at the top 5 lines for a likely name
        for item in sorted_by_y[:5]:
            text = item[1].strip()
            # Ignore purely numeric or date-like strings
            if len(text) > 3 and not self.date_pattern.search(text) and not self.amount_pattern.search(text):
                # Check if it has letters
                if re.search(r'[A-Za-z]', text):
                    return text
        return None

    def process(self, file_bytes: bytes, file_category: str) -> dict:
        """
        Processes document bytes and extracts entities + scores.
        file_category should be 'document' (PDF) or 'image'.
        """
        try:
            if file_category == "document":
                images = self._convert_pdf_to_images(file_bytes)
                if not images:
                    raise ValueError("Failed to extract image from PDF")
                img = images[0]
            else:
                img = self._convert_bytes_to_image(file_bytes)
                if img is None:
                    raise ValueError("Failed to decode image bytes")

            # Run Tesseract OCR
            data = pytesseract.image_to_data(img, output_type=Output.DICT)
            results = []
            for i in range(len(data['text'])):
                text = data['text'][i]
                if text.strip():
                    x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
                    bbox = [[x, y], [x+w, y], [x+w, y+h], [x, y+h]]
                    conf_val = str(data['conf'][i])
                    prob = float(conf_val) / 100.0 if conf_val != '-1' else 0.0
                    results.append((bbox, text, prob))
            
            full_text = " ".join([r[1] for r in results])
            
            # Extract Entities
            dates = self.date_pattern.findall(full_text)
            amounts = self._extract_amounts(full_text)
            supplier = self._extract_supplier_name(results)
            
            # Calculate Total Amount (Heuristic: usually the largest amount or last amount, let's pick largest)
            total_amount = amounts[0] if amounts else 0.0
            
            # Overall confidence
            confidences = [r[2] for r in results]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            # --- Scoring Logic ---
            
            # 1. Invoice Activity Score (0-100)
            # Higher if we found a date (recent is better, but we just check presence for now),
            # total amount, and it looks like a real invoice (multiple line items/amounts).
            activity_score = 0
            if dates: activity_score += 40
            if total_amount > 0: activity_score += 30
            if len(amounts) > 3: activity_score += 30 # Suggests line items exist
            
            # 2. Transaction Consistency Score (0-100)
            # Checks if the data looks consistent. E.g., does supplier exist? Does max amount make sense?
            # A simple heuristic: if sum of smaller amounts roughly equals the max amount.
            consistency_score = 50 # Baseline
            if supplier:
                consistency_score += 20
                
            if len(amounts) > 1 and total_amount > 0:
                # Sum of all amounts except the max
                sum_parts = sum(amounts[1:])
                # If sum of parts is within 10% of total amount, high consistency
                if abs(sum_parts - total_amount) / total_amount < 0.1:
                    consistency_score += 30
                else:
                    consistency_score += 10 # Some amounts exist, but don't perfectly sum
            
            return {
                "extracted_text": full_text[:1000], # Keep it bounded for DB
                "dates_found": dates,
                "amounts_found": amounts[:10], # Top 10 amounts
                "total_amount": total_amount,
                "merchant_name": supplier,
                "confidence": avg_confidence,
                "invoice_activity_score": min(activity_score, 100),
                "transaction_consistency_score": min(consistency_score, 100)
            }
            
        except Exception as e:
            logger.error(f"OCR Processing failed: {e}")
            return {
                "extracted_text": "",
                "total_amount": 0.0,
                "merchant_name": None,
                "confidence": 0.0,
                "invoice_activity_score": 0.0,
                "transaction_consistency_score": 0.0
            }
