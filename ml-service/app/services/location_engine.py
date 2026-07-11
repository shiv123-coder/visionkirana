import abc
import random
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class BaseLocationProvider(abc.ABC):
    """
    Abstract interface for Location Data Providers.
    Designed to easily plug in Google Maps API, OpenStreetMap (Overpass), etc.
    """
    
    @abc.abstractmethod
    def get_nearby_competitors(self, lat: float, lng: float, radius_meters: int = 1000) -> List[Dict[str, Any]]:
        """Returns a list of competing grocery/kirana stores within the radius."""
        pass

    @abc.abstractmethod
    def get_points_of_interest(self, lat: float, lng: float, radius_meters: int = 1000) -> List[Dict[str, Any]]:
        """Returns a list of footfall drivers (schools, hospitals, bus stops, etc.)"""
        pass
        
    @abc.abstractmethod
    def get_area_demographics(self, lat: float, lng: float) -> Dict[str, Any]:
        """Returns demographic/zoning data (residential vs commercial density)."""
        pass


class MockLocationProvider(BaseLocationProvider):
    """
    Mock implementation for testing without live API keys.
    Generates realistic randomized data based on coordinates.
    """
    def _seed(self, lat: float, lng: float):
        # Use coordinates to generate a deterministic random seed
        random.seed(int((lat + lng) * 10000))

    def get_nearby_competitors(self, lat: float, lng: float, radius_meters: int = 1000) -> List[Dict[str, Any]]:
        self._seed(lat, lng)
        # Randomly generate 1 to 20 competitors
        count = random.randint(1, 20)
        return [{"name": f"Competitor {i}", "distance": random.randint(10, radius_meters)} for i in range(count)]

    def get_points_of_interest(self, lat: float, lng: float, radius_meters: int = 1000) -> List[Dict[str, Any]]:
        self._seed(lat, lng + 1) # slightly different seed
        count = random.randint(0, 15)
        poi_types = ["school", "hospital", "bus_stop", "metro_station", "residential_complex"]
        return [
            {
                "type": random.choice(poi_types),
                "distance": random.randint(10, radius_meters)
            } for _ in range(count)
        ]

    def get_area_demographics(self, lat: float, lng: float) -> Dict[str, Any]:
        self._seed(lat, lng + 2)
        return {
            "residential_density": random.uniform(0.3, 0.9), # 30% to 90%
            "commercial_density": random.uniform(0.1, 0.6)
        }


class LocationIntelligenceEngine:
    """
    Calculates intelligent business scores based on raw geographic data.
    """
    def __init__(self, provider: BaseLocationProvider = None):
        self.provider = provider or MockLocationProvider()

    def calculate_market_area_score(self, lat: float, lng: float) -> float:
        """
        Calculates a 0-100 score based on how lucrative the general area is.
        High residential + moderate commercial usually means a good market for a Kirana.
        """
        try:
            demo = self.provider.get_area_demographics(lat, lng)
            res_density = demo.get("residential_density", 0.5)
            com_density = demo.get("commercial_density", 0.2)
            
            # Ideal mix for Kirana: High Residential (0.8), Moderate Commercial (0.4)
            # Maximum score is 100
            score = (res_density * 60) + (com_density * 40)
            
            # Boost if it hits the "sweet spot"
            if 0.6 <= res_density <= 0.9 and 0.2 <= com_density <= 0.5:
                score += 15
                
            return round(min(max(score, 0), 100), 2)
        except Exception as e:
            logger.error(f"Error calculating market area score: {e}")
            return 0.0

    def calculate_competition_density_score(self, lat: float, lng: float) -> float:
        """
        Calculates a 0-100 score representing how favorable the competition is.
        0 = Saturated market (too many competitors).
        100 = Monopoly/Underserved market (few competitors).
        """
        try:
            competitors = self.provider.get_nearby_competitors(lat, lng)
            count = len(competitors)
            
            # If 0 competitors, perfect score (monopoly)
            if count == 0:
                return 100.0
                
            # If >= 15 competitors in 1km, saturated market
            if count >= 15:
                return 10.0
                
            # Linear scale: 100 at 0, 10 at 15
            score = 100 - (count * 6.0)
            return round(min(max(score, 0), 100), 2)
        except Exception as e:
            logger.error(f"Error calculating competition density score: {e}")
            return 0.0

    def calculate_footfall_proxy_score(self, lat: float, lng: float) -> float:
        """
        Calculates a 0-100 score based on nearby Points of Interest (POIs)
        that drive foot traffic.
        """
        try:
            pois = self.provider.get_points_of_interest(lat, lng)
            
            if not pois:
                return 10.0 # Baseline
                
            score = 10.0
            for poi in pois:
                poi_type = poi.get("type", "")
                distance = poi.get("distance", 1000)
                
                # Closer POIs give more points
                distance_multiplier = max(1.0 - (distance / 1000.0), 0.1)
                
                if poi_type in ["bus_stop", "metro_station"]:
                    score += 15 * distance_multiplier
                elif poi_type == "residential_complex":
                    score += 20 * distance_multiplier
                elif poi_type in ["school", "hospital"]:
                    score += 10 * distance_multiplier
                else:
                    score += 5 * distance_multiplier
                    
            return round(min(max(score, 0), 100), 2)
        except Exception as e:
            logger.error(f"Error calculating footfall proxy score: {e}")
            return 0.0

    def generate_full_report(self, lat: float, lng: float) -> Dict[str, float]:
        """Runs all location intelligence calculations."""
        return {
            "market_area_score": self.calculate_market_area_score(lat, lng),
            "competition_density_score": self.calculate_competition_density_score(lat, lng),
            "footfall_proxy_score": self.calculate_footfall_proxy_score(lat, lng)
        }

# Example usage
# if __name__ == "__main__":
#     engine = LocationIntelligenceEngine()
#     print(engine.generate_full_report(12.9716, 77.5946)) # Bangalore coordinates
