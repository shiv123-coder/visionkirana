import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class RiskEngine:
    """
    Core Risk Assessment Engine for Vision Kirana.
    Aggregates scores from various intelligence modules to produce a
    final Business Health Score and Risk Category.
    """
    
    # Pre-defined weights based on business requirements
    WEIGHTS = {
        "shelf_density": 0.20,
        "product_diversity": 0.15,
        "invoice_activity": 0.20,
        "business_age": 0.10,
        "location_score": 0.15,
        "sales_consistency": 0.10,
        "document_completeness": 0.10
    }
    
    def __init__(self):
        # Validate weights sum to 1.0 (100%)
        total_weight = sum(self.WEIGHTS.values())
        if abs(total_weight - 1.0) > 0.001:
            logger.warning(f"RiskEngine weights do not sum to 1.0! Total: {total_weight}")

    def calculate_business_health_score(self, scores: Dict[str, float]) -> float:
        """
        Calculates the weighted average of all input scores.
        Missing scores default to 0.0 to heavily penalize missing data.
        """
        health_score = 0.0
        
        for key, weight in self.WEIGHTS.items():
            # Get the score (0-100), default to 0 if missing
            component_score = scores.get(key, 0.0)
            
            # Ensure score is within 0-100 bounds
            component_score = min(max(component_score, 0.0), 100.0)
            
            health_score += (component_score * weight)
            
        return round(health_score, 2)

    def determine_risk_category(self, health_score: float) -> str:
        """
        Maps a 0-100 Business Health Score to a Risk Category.
        
        Score Ranges:
        80 - 100 : Low Risk
        60 - 79  : Medium Risk
        40 - 59  : High Risk
        0  - 39  : Very High Risk
        """
        if health_score >= 80:
            return "Low Risk"
        elif health_score >= 60:
            return "Medium Risk"
        elif health_score >= 40:
            return "High Risk"
        else:
            return "Very High Risk"

    def calculate_business_age_score(self, years_in_business: int) -> float:
        """
        Helper method to map years in business to a 0-100 score.
        E.g., 0 years = 0, 5+ years = 100.
        """
        if not years_in_business or years_in_business < 0:
            return 0.0
        if years_in_business >= 5:
            return 100.0
        
        return (years_in_business / 5.0) * 100.0

    def calculate_document_completeness_score(self, uploaded_docs: int, required_docs: int = 5) -> float:
        """
        Helper method to map document completeness to a 0-100 score.
        """
        if required_docs <= 0:
            return 100.0
        ratio = uploaded_docs / float(required_docs)
        return min(ratio * 100.0, 100.0)

    def generate_risk_report(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a complete risk report given raw input parameters.
        Expected raw_data keys:
        - shelf_density_score (float)
        - product_diversity_score (float)
        - invoice_activity_score (float)
        - years_in_business (int)
        - location_score (float)
        - sales_consistency_score (float)
        - uploaded_documents_count (int)
        - required_documents_count (int, optional, defaults to 5)
        """
        try:
            # 1. Normalize/calculate sub-scores
            scores = {
                "shelf_density": raw_data.get("shelf_density_score", 0.0),
                "product_diversity": raw_data.get("product_diversity_score", 0.0),
                "invoice_activity": raw_data.get("invoice_activity_score", 0.0),
                "location_score": raw_data.get("location_score", 0.0),
                "sales_consistency": raw_data.get("sales_consistency_score", 0.0),
                
                # Computed sub-scores
                "business_age": self.calculate_business_age_score(
                    raw_data.get("years_in_business", 0)
                ),
                "document_completeness": self.calculate_document_completeness_score(
                    raw_data.get("uploaded_documents_count", 0),
                    raw_data.get("required_documents_count", 5)
                )
            }
            
            # 2. Calculate Final Health Score
            health_score = self.calculate_business_health_score(scores)
            
            # 3. Determine Risk Category
            risk_category = self.determine_risk_category(health_score)
            
            return {
                "business_health_score": health_score,
                "risk_category": risk_category,
                "component_scores": scores,
                "weights_used": self.WEIGHTS
            }
            
        except Exception as e:
            logger.error(f"Error generating risk report: {e}")
            return {
                "business_health_score": 0.0,
                "risk_category": "Very High Risk",
                "error": str(e)
            }
