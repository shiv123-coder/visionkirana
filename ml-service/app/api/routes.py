from fastapi import APIRouter, File, HTTPException, UploadFile, BackgroundTasks
from typing import Any
import traceback
import time
from app.services.vision_analyzer import VisionAnalyzer
from app.services.ocr_processor import OCRProcessor
from app.services.voice_processor import VoiceProcessor
from app.services.location_engine import LocationIntelligenceEngine
from app.services.risk_engine import RiskEngine
from app.core.firebase import get_firestore_client
from firebase_admin import firestore
from pydantic import BaseModel

router = APIRouter()

vision_analyzer = VisionAnalyzer()
ocr_processor = OCRProcessor()
voice_processor = VoiceProcessor()
risk_engine = RiskEngine()
loc_engine = LocationIntelligenceEngine()

class AnalyzeRequest(BaseModel):
    application_id: str

def run_application_analysis_job(application_id: str):
    """
    Background job to run all heavy ML models and update Firestore directly.
    """
    try:
        db = get_firestore_client()
        app_ref = db.collection("applications").document(application_id)
        app_doc = app_ref.get()
        
        if not app_doc.exists:
            print(f"Job failed: Application {application_id} not found")
            return
            
        app_data = app_doc.to_dict()
        
        # Simulate heavy ML work (gathering images, running OCR, etc)
        # For a real implementation, we would fetch the image URLs from `evidence_files` collection,
        # download them, and pass the bytes to `vision_analyzer` and `ocr_processor`.
        print(f"Starting ML analysis for application {application_id}...")
        
        # Simulate taking time for heavy ML models
        time.sleep(5) 
        
        # Generate risk report
        # We pass basic data to the risk engine to get a simulated report
        risk_data = {
            "requested_amount": app_data.get("requested_amount", 100000),
            "monthly_sales": 50000, # Would fetch from shop doc in real life
            "years_in_business": 2
        }
        
        risk_report = risk_engine.generate_risk_report(risk_data)
        
        # Update Firestore directly with results!
        app_ref.update({
            "status": "completed",
            "health_score": risk_report.get("overall_score", 85),
            "risk_report": risk_report,
            "analysis_completed_at": firestore.SERVER_TIMESTAMP
        })
        
        # Generate Notification for completion
        db.collection("notifications").add({
            "type": "analysis_completed",
            "message": f"AI analysis completed for application.",
            "user_id": app_data.get("user_id"),
            "target_roles": ["admin", "loan_officer", "shop_owner"],
            "read_by": [],
            "created_at": firestore.SERVER_TIMESTAMP,
            "related_entity_id": application_id,
            "related_entity_type": "application"
        })
        
        print(f"Job completed for application {application_id}")
        
    except Exception as e:
        print(f"Job crashed for application {application_id}: {str(e)}")
        try:
            db = get_firestore_client()
            db.collection("applications").document(application_id).update({
                "status": "failed",
                "error": str(e)
            })
        except:
            pass

@router.post("/jobs/analyze-application", status_code=202)
async def start_analyze_application(req: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Kicks off an async background task to analyze a loan application.
    Returns 202 Accepted immediately.
    """
    background_tasks.add_task(run_application_analysis_job, req.application_id)
    return {"status": "processing", "application_id": req.application_id}

@router.get("/health")
def api_health():
    return {"status": "healthy"}

@router.post("/analyze/image")
async def analyze_image(file: UploadFile = File(...)) -> Any:
    try:
        contents = await file.read()
        image_quality = vision_analyzer.calculateImageQuality(contents)
        shelf_density = vision_analyzer.calculateShelfDensity(contents)
        store_org = vision_analyzer.estimateStoreOrganization(contents)
        diversity = vision_analyzer.estimateProductDiversity(contents)
        visibility = vision_analyzer.calculateInventoryVisibility(contents)
        barcode = vision_analyzer.verifyBarcode(contents)
        
        return {
            "image_quality_score": image_quality,
            "shelf_density_score": shelf_density,
            "store_organization_score": store_org,
            "brand_diversity_score": diversity,
            "inventory_visibility_score": visibility,
            "barcode_data": barcode
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/ocr")
async def analyze_ocr(category: str, file: UploadFile = File(...)) -> Any:
    try:
        contents = await file.read()
        results = ocr_processor.process(contents, category)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/voice")
async def analyze_voice(file: UploadFile = File(...)) -> Any:
    try:
        contents = await file.read()
        transcript, sentiment = voice_processor.process_audio(contents)
        return {
            "transcript": transcript,
            "sentiment_score": sentiment
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract/risk-features")
async def extract_risk_features(data: dict) -> Any:
    try:
        report = risk_engine.generate_risk_report(data)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyze/location")
async def analyze_location(lat: float, lng: float) -> Any:
    try:
        return loc_engine.generate_full_report(lat, lng)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
