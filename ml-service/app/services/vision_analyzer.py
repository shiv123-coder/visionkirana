import cv2
import numpy as np
from pyzbar.pyzbar import decode
import logging

logger = logging.getLogger(__name__)

class VisionAnalyzer:
    """
    A production-ready computer vision module for analyzing shop and inventory images.
    Provides methods to score different aspects of shop organization and image quality
    on a 0-100 scale.
    """
    def __init__(self):
        pass

    def _read_image(self, image):
        """
        Helper method to normalize image input.
        Accepts a file path string, bytes, or an existing numpy array (cv2 image).
        """
        if isinstance(image, str):
            img = cv2.imread(image)
            if img is None:
                raise ValueError(f"Could not read image from path: {image}")
            return img
        elif isinstance(image, bytes):
            nparr = np.frombuffer(image, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Could not decode image bytes")
            return img
        elif isinstance(image, np.ndarray):
            return image
        else:
            raise TypeError("Unsupported image format. Provide path, bytes, or numpy array.")

    def calculateImageQuality(self, image) -> float:
        """
        Calculates image quality based on blurriness using Variance of the Laplacian.
        Returns a score from 0-100.
        """
        try:
            img = self._read_image(image)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            variance = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Map variance to 0-100 score. 
            # Variance < 100 is typically considered blurry. 
            # We map up to 500+ as excellent quality (100).
            score = np.clip((variance / 500.0) * 100, 0, 100)
            return round(float(score), 2)
        except Exception as e:
            logger.error(f"Error in calculateImageQuality: {str(e)}")
            return 0.0

    def calculateShelfDensity(self, image) -> float:
        """
        Calculates shelf density based on edge density. 
        More edges usually imply more products packed onto shelves.
        Returns a score from 0-100.
        """
        try:
            img = self._read_image(image)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Canny edge detection
            edges = cv2.Canny(blurred, 50, 150)
            
            # Calculate percentage of edge pixels
            total_pixels = edges.shape[0] * edges.shape[1]
            edge_pixels = np.count_nonzero(edges)
            
            if total_pixels == 0:
                return 0.0
                
            density_percentage = (edge_pixels / total_pixels) * 100
            
            # Empirical scaling: 15% edge pixels is quite dense for a shelf
            score = np.clip((density_percentage / 15.0) * 100, 0, 100)
            return round(float(score), 2)
        except Exception as e:
            logger.error(f"Error in calculateShelfDensity: {str(e)}")
            return 0.0

    def estimateStoreOrganization(self, image) -> float:
        """
        Estimates store organization by detecting structured horizontal and vertical lines.
        Structured linear geometry indicates neat shelves and organized products.
        Returns a score from 0-100.
        """
        try:
            img = self._read_image(image)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150, apertureSize=3)
            
            # Hough Line Transform to detect straight lines
            lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=100, maxLineGap=10)
            
            if lines is None or len(lines) == 0:
                return 0.0
                
            aligned_lines = 0
            for line in lines:
                x1, y1, x2, y2 = line[0]
                # Calculate angle of the line
                angle = np.abs(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
                
                # Check if nearly horizontal (0/180 ± 10 deg) or vertical (90 ± 10 deg)
                if (angle < 10 or angle > 170) or (80 < angle < 100):
                    aligned_lines += 1
                    
            # Ratio of structurally aligned lines to total lines found
            organization_ratio = aligned_lines / max(len(lines), 1)
            
            # Factor in absolute number of lines to avoid high scores for empty images
            # Assuming an organized shelf image has at least 50 distinct lines
            line_volume_score = np.clip((len(lines) / 50.0) * 100, 0, 100)
            
            # Weighted average: Alignment is more important than pure volume
            score = (organization_ratio * 100) * 0.7 + line_volume_score * 0.3
            return round(float(np.clip(score, 0, 100)), 2)
        except Exception as e:
            logger.error(f"Error in estimateStoreOrganization: {str(e)}")
            return 0.0

    def estimateProductDiversity(self, image) -> float:
        """
        Estimates product diversity by analyzing color distribution entropy.
        Higher color entropy generally correlates with diverse product packaging.
        Returns a score from 0-100.
        """
        try:
            img = self._read_image(image)
            
            # Convert to HSV for robust color representation
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            
            # Calculate 2D histogram for Hue and Saturation (ignore Value/Brightness)
            hist = cv2.calcHist([hsv], [0, 1], None, [16, 16], [0, 180, 0, 256])
            
            # Normalize histogram
            cv2.normalize(hist, hist, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
            
            # Calculate Shannon Entropy of the color distribution
            hist_flat = hist.flatten()
            hist_flat = hist_flat[hist_flat > 0] # Remove zeros to avoid log(0) error
            
            if len(hist_flat) == 0:
                return 0.0
                
            entropy = -np.sum(hist_flat * np.log2(hist_flat))
            
            # Max theoretical entropy for 16x16 (256) bins is 8.0. 
            # An entropy of 5.0 is typically considered highly diverse.
            score = np.clip((entropy / 5.0) * 100, 0, 100)
            return round(float(score), 2)
        except Exception as e:
            logger.error(f"Error in estimateProductDiversity: {str(e)}")
            return 0.0

    def calculateInventoryVisibility(self, image) -> float:
        """
        Calculates how well the inventory can be seen.
        Penalizes overly dark or overly bright images (poor contrast/lighting).
        Returns a score from 0-100.
        """
        try:
            img = self._read_image(image)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Check overall brightness
            mean_brightness = np.mean(gray)
            
            # Ideal brightness is around 128. Penalize extremes.
            if mean_brightness < 20 or mean_brightness > 235:
                brightness_score = 0.0
            else:
                brightness_score = 100 - abs(mean_brightness - 127) / 127.0 * 100
                
            # Check contrast using standard deviation
            contrast = np.std(gray)
            
            # Ideal contrast std dev is around 50-80
            contrast_score = np.clip((contrast / 50.0) * 100, 0, 100)
            
            # Final score blends ideal lighting and high contrast
            score = (brightness_score * 0.6) + (contrast_score * 0.4)
            return round(float(np.clip(score, 0, 100)), 2)
        except Exception as e:
            logger.error(f"Error in calculateInventoryVisibility: {str(e)}")
            return 0.0

    def verifyBarcode(self, image) -> dict:
        """
        Detects and decodes barcodes in the image using pyzbar.
        Returns a structured dictionary with detection results.
        """
        try:
            img = self._read_image(image)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            barcodes = decode(gray)
            
            results = {
                "found": len(barcodes) > 0,
                "count": len(barcodes),
                "data": []
            }
            
            for barcode in barcodes:
                barcode_data = barcode.data.decode("utf-8")
                barcode_type = barcode.type
                
                # Extract bounding box polygon if needed for drawing later
                points = []
                if hasattr(barcode, 'polygon') and barcode.polygon:
                    points = [{"x": p.x, "y": p.y} for p in barcode.polygon]
                
                results["data"].append({
                    "value": barcode_data,
                    "type": barcode_type,
                    "polygon": points
                })
                
            return results
        except Exception as e:
            logger.error(f"Error in verifyBarcode: {str(e)}")
            return {"found": False, "count": 0, "data": [], "error": str(e)}

# --- Example Usage ---
# if __name__ == "__main__":
#     analyzer = VisionAnalyzer()
#     score = analyzer.calculateImageQuality("path_to_image.jpg")
#     print(f"Quality Score: {score}")
