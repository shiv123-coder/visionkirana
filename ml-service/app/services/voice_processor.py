import abc
import logging
import os
import io
import json
import speech_recognition as sr
from pydub import AudioSegment
import google.generativeai as genai

logger = logging.getLogger(__name__)

class BaseVoiceRecognizer(abc.ABC):
    """
    Abstract interface for Voice Recognition.
    """
    @abc.abstractmethod
    def transcribe(self, audio_bytes: bytes) -> str:
        pass

class RealVoiceRecognizer(BaseVoiceRecognizer):
    """
    A real implementation of the VoiceRecognizer using SpeechRecognition and Google Web Speech API.
    """
    def __init__(self):
        self.recognizer = sr.Recognizer()

    def transcribe(self, audio_bytes: bytes) -> str:
        if not audio_bytes:
            return ""

        try:
            # Convert audio bytes to WAV format using pydub
            # We assume the input might be webm, mp3, ogg, etc.
            audio_stream = io.BytesIO(audio_bytes)
            
            try:
                # Try to load it automatically
                audio = AudioSegment.from_file(audio_stream)
            except Exception as e:
                logger.warning(f"Failed to auto-detect audio format, trying webm: {e}")
                # Common format from web browsers
                audio_stream.seek(0)
                audio = AudioSegment.from_file(audio_stream, format="webm")

            wav_stream = io.BytesIO()
            audio.export(wav_stream, format="wav")
            wav_stream.seek(0)

            # Use speech_recognition to transcribe
            with sr.AudioFile(wav_stream) as source:
                audio_data = self.recognizer.record(source)
                # Using Google's free Web Speech API
                text = self.recognizer.recognize_google(audio_data)
                return text

        except sr.UnknownValueError:
            logger.warning("Google Speech Recognition could not understand audio")
            return "Could not understand audio."
        except sr.RequestError as e:
            logger.error(f"Could not request results from Google Speech Recognition service; {e}")
            return "Speech recognition service unavailable."
        except Exception as e:
            logger.error(f"Error processing audio in RealVoiceRecognizer: {e}")
            return "Error processing audio."

class MockVoiceRecognizer(BaseVoiceRecognizer):
    """
    Fallback mock implementation.
    """
    def transcribe(self, audio_bytes: bytes) -> str:
        return (
            "Namaste, I am running a kirana shop for the last 10 years in this market. "
            "My daily sales are good, usually around 5000 to 8000 rupees. "
            "However, I want to take a loan of 2 lakh rupees because I want to expand my shop "
            "and add a small cold storage section for dairy and beverages. "
            "The main challenge right now is the competition from new supermarkets, "
            "but my loyal customers still come to me for daily groceries. "
            "In the future, I plan to start home delivery and modernize my billing system."
        )

class BaseVoiceAnalyzer(abc.ABC):
    @abc.abstractmethod
    def analyze(self, transcript: str) -> dict:
        pass

class LLMVoiceAnalyzer(BaseVoiceAnalyzer):
    """
    Analyzes transcripts using Google Gemini API to extract key business insights.
    """
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        # Use the gemini-1.5-flash model as it is fast and cost-effective for text processing
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def analyze(self, transcript: str) -> dict:
        if not transcript or len(transcript.strip()) < 10:
            return self._empty_result()

        prompt = f"""
        You are an expert loan officer evaluating a Kirana (grocery) store owner's speech transcript.
        Analyze the following transcript and extract the key business insights in JSON format.
        
        Transcript: "{transcript}"
        
        Provide the response as a strict JSON object with EXACTLY these keys:
        - "business_summary": A concise 1-2 sentence summary of the business.
        - "loan_purpose": What do they need the loan for?
        - "challenges": What challenges are they facing?
        - "future_plans": What are their future plans?
        - "sentiment_score": Evaluate the overall tone (Must be exactly one of: "Positive", "Neutral", "Negative")
        
        Do not include markdown formatting or backticks. Just output the raw JSON.
        """

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Clean up markdown if the model included it despite instructions
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
                
            return json.loads(result_text.strip())
        except Exception as e:
            logger.error(f"Error in LLMVoiceAnalyzer: {e}")
            return self._empty_result()

    def _empty_result(self) -> dict:
        return {
            "business_summary": "Unable to extract summary.",
            "loan_purpose": "Not clearly mentioned.",
            "challenges": "None explicitly stated.",
            "future_plans": "Not specified.",
            "sentiment_score": "Neutral"
        }

class HeuristicVoiceAnalyzer(BaseVoiceAnalyzer):
    """
    Fallback heuristic analyzer.
    """
    def analyze(self, transcript: str) -> dict:
        transcript_lower = transcript.lower()
        
        loan_purpose = "Not clearly mentioned"
        if "loan" in transcript_lower or "rupees" in transcript_lower:
            sentences = transcript.split('.')
            for s in sentences:
                if 'loan' in s.lower() or 'want to' in s.lower() or 'expand' in s.lower():
                    loan_purpose = s.strip()
                    break

        challenges = "None explicitly stated"
        if "challenge" in transcript_lower or "problem" in transcript_lower or "competition" in transcript_lower:
            sentences = transcript.split('.')
            for s in sentences:
                if 'challenge' in s.lower() or 'competition' in s.lower() or 'difficult' in s.lower():
                    challenges = s.strip()
                    break
                    
        future_plans = "Not specified"
        if "future" in transcript_lower or "plan" in transcript_lower or "later" in transcript_lower:
            sentences = transcript.split('.')
            for s in sentences:
                if 'future' in s.lower() or 'plan' in s.lower() or 'start' in s.lower():
                    future_plans = s.strip()
                    break
                    
        sentences = [s.strip() for s in transcript.split('.') if len(s.strip()) > 5]
        summary = ". ".join(sentences[:2]) + "." if len(sentences) >= 2 else transcript
        
        sentiment = "Positive"
        if "challenge" in transcript_lower or "difficult" in transcript_lower:
            sentiment = "Neutral"

        return {
            "business_summary": summary,
            "loan_purpose": loan_purpose,
            "challenges": challenges,
            "future_plans": future_plans,
            "sentiment_score": sentiment
        }

class VoiceProcessor:
    def __init__(self):
        # We try to use Real implementations, fallback to mock/heuristics if missing config
        self.recognizer = RealVoiceRecognizer()
        
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if gemini_api_key and gemini_api_key != "your_gemini_api_key_here":
            logger.info("Initializing LLMVoiceAnalyzer with Gemini API.")
            self.analyzer = LLMVoiceAnalyzer(api_key=gemini_api_key)
        else:
            logger.warning("GEMINI_API_KEY not found or invalid. Falling back to HeuristicVoiceAnalyzer.")
            self.analyzer = HeuristicVoiceAnalyzer()

    def process_audio(self, audio_bytes: bytes):
        transcript = self.recognizer.transcribe(audio_bytes)
        analysis = self.analyzer.analyze(transcript)
        return transcript, analysis.get("sentiment_score", "Neutral")

