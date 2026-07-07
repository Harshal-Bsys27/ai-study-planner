"""
AI Service Module - Multi-Provider Support (Gemini, Groq, Ollama, Hugging Face, OpenAI)

Features:
- AI-powered study plan generation
- Flashcard Q&A generation
- Configurable provider switching

Supported Providers:
- groq: Groq API - LLaMA 3 / Mixtral (recommended, 14,400 req/day free)
- gemini: Google Gemini API (free tier available)
- ollama: Local Ollama (completely free, no API key needed)
- huggingface: Hugging Face Inference API (free tier available)
- openai: OpenAI API (paid only)
"""

import os
import json
import logging
import re
from typing import List, Dict, Optional
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

# =============================================================================
# PROVIDER IMPLEMENTATIONS
# =============================================================================

class AIProvider(ABC):
    """Base class for AI providers."""
    
    @abstractmethod
    def generate_flashcards(self, topic: str, num_cards: int) -> List[Dict]:
        pass
    
    @abstractmethod
    def generate_study_plan(self, subject: str, level: str, days: int, hours_per_day: float) -> List[Dict]:
        pass


class GeminiProvider(AIProvider):
    """Google Gemini API Provider"""
    
    def __init__(self, model_override: str = None):
        try:
            import google.generativeai as genai
            self.genai = genai
            self.available = True
        except ImportError:
            logger.warning("⚠️ google-generativeai not installed")
            self.available = False
            return
        
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        model = model_override or os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        
        if not api_key:
            logger.warning("⚠️ GEMINI_API_KEY not set")
            self.available = False
            return
        
        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(model)
            self.api_key = api_key
            self.model_name = model
            logger.info(f"✅ Gemini provider initialized: {model}")
        except Exception as e:
            logger.error(f"❌ Gemini init failed: {e}")
            self.available = False
    
    def generate_flashcards(self, topic: str, num_cards: int = 5) -> List[Dict]:
        if not self.available:
            raise Exception("Gemini provider not available")
        
        try:
            prompt = (
                f"Generate exactly {num_cards} flashcard Q&A pairs for: {topic}\n\n"
                "Return ONLY a JSON array with no extra text or markdown:\n"
                '[{"question": "...", "answer": "..."}]\n\n'
                "Requirements:\n"
                "- Questions should test understanding\n"
                "- Keep answers concise (1-2 sentences)\n"
                "- Valid JSON array only\n"
                "- Each object must have 'question' and 'answer' keys"
            )
            
            response = self.model.generate_content(prompt, generation_config={'temperature': 0.7})
            text = response.text if response else ""
            
            if not text:
                raise Exception("Empty response from Gemini API")
            
            cards = self._parse_json_list(text)
            if not cards:
                raise Exception(f"Could not parse flashcard data from response")
            
            logger.info(f"✅ Generated {len(cards)} flashcards via Gemini")
            return cards
            
        except Exception as e:
            error_msg = str(e)
            if "quota" in error_msg.lower() or "resource_exhausted" in error_msg.lower():
                logger.error(f"❌ Gemini quota exceeded: {error_msg[:150]}")
                raise Exception("API quota exceeded. Please wait and try again.")
            else:
                logger.error(f"❌ Gemini error: {error_msg[:200]}")
                raise Exception(f"Gemini error: {error_msg[:100]}")
    
    def generate_study_plan(self, subject: str, level: str, days: int, hours_per_day: float) -> List[Dict]:
        if not self.available:
            raise Exception("Gemini provider not available")
        
        try:
            prompt = (
                f"Create a {days}-day study plan for {subject} (Level: {level}).\n"
                f"Total: {hours_per_day} hours per day.\n"
                "Return ONLY a JSON array:\n"
                '[{"day": 1, "topic": "...", "hours": 2, "details": "..."}, ...]\n'
            )
            
            response = self.model.generate_content(prompt, generation_config={'temperature': 0.5})
            text = response.text if response else ""
            
            if not text:
                raise Exception("Empty response from Gemini")
            
            plans = self._parse_json_list(text)
            if not plans:
                raise Exception("Could not parse plan data")
            
            logger.info(f"✅ Generated study plan via Gemini")
            return plans
            
        except Exception as e:
            logger.error(f"❌ Gemini study plan error: {str(e)[:200]}")
            raise
    
    def _parse_json_list(self, text: str) -> List[Dict]:
        """Extract and parse JSON array from response text."""
        # Remove markdown code blocks
        text = re.sub(r'^```json\s*', '', text)
        text = re.sub(r'^```\s*', '', text)
        text = re.sub(r'\s*```$', '', text)
        text = text.strip()
        
        # Extract JSON array
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if not match:
            return []
        
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            return []


class OllamaProvider(AIProvider):
    """Local Ollama Provider - Free, no API key needed"""
    
    def __init__(self, model_override: str = None):
        try:
            import requests
            self.requests = requests
            self.available = True
        except ImportError:
            logger.warning("⚠️ requests library not installed (needed for Ollama)")
            self.available = False
            return
        
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = model_override or os.getenv("OLLAMA_MODEL", "llama2")
        
        # Test connection
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                logger.info(f"✅ Ollama provider initialized: {self.model} at {self.base_url}")
            else:
                logger.warning(f"⚠️ Ollama returned {response.status_code}")
                self.available = False
        except Exception as e:
            logger.warning(f"⚠️ Ollama not available at {self.base_url}: {e}")
            self.available = False
    
    def generate_flashcards(self, topic: str, num_cards: int = 5) -> List[Dict]:
        if not self.available:
            raise Exception("Ollama provider not available")
        
        try:
            prompt = (
                f"Generate exactly {num_cards} flashcard Q&A pairs for: {topic}\n\n"
                "Return ONLY a JSON array:\n"
                '[{"question": "...", "answer": "..."}]\n'
            )
            
            response = self.requests.post(
                f"{self.base_url}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": False},
                timeout=60
            )
            
            if response.status_code != 200:
                raise Exception(f"Ollama returned {response.status_code}")
            
            data = response.json()
            text = data.get("response", "")
            
            if not text:
                raise Exception("Empty response from Ollama")
            
            cards = self._parse_json_list(text)
            if not cards:
                raise Exception("Could not parse flashcard data")
            
            logger.info(f"✅ Generated {len(cards)} flashcards via Ollama")
            return cards
            
        except Exception as e:
            logger.error(f"❌ Ollama error: {str(e)[:200]}")
            raise
    
    def generate_study_plan(self, subject: str, level: str, days: int, hours_per_day: float) -> List[Dict]:
        if not self.available:
            raise Exception("Ollama provider not available")
        
        try:
            prompt = (
                f"Create a {days}-day study plan for {subject} (Level: {level}).\n"
                f"Total: {hours_per_day} hours per day.\n"
                "Return ONLY a JSON array:\n"
                '[{"day": 1, "topic": "...", "hours": 2, "details": "..."}, ...]\n'
            )
            
            response = self.requests.post(
                f"{self.base_url}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": False},
                timeout=120
            )
            
            if response.status_code != 200:
                raise Exception(f"Ollama returned {response.status_code}")
            
            data = response.json()
            text = data.get("response", "")
            
            plans = self._parse_json_list(text)
            if not plans:
                raise Exception("Could not parse plan data")
            
            logger.info(f"✅ Generated study plan via Ollama")
            return plans
            
        except Exception as e:
            logger.error(f"❌ Ollama study plan error: {str(e)[:200]}")
            raise
    
    def _parse_json_list(self, text: str) -> List[Dict]:
        """Extract and parse JSON array."""
        text = re.sub(r'^```json\s*', '', text)
        text = re.sub(r'^```\s*', '', text)
        text = re.sub(r'\s*```$', '', text)
        text = text.strip()
        
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if not match:
            return []
        
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            return []


class HuggingFaceProvider(AIProvider):
    """Hugging Face Inference API Provider"""
    
    def __init__(self, model_override: str = None):
        try:
            from huggingface_hub import InferenceClient
            self.InferenceClient = InferenceClient
            self.available = True
        except ImportError:
            logger.warning("⚠️ huggingface-hub not installed")
            self.available = False
            return
        
        api_key = os.getenv("HUGGINGFACE_API_KEY", "").strip()
        model = model_override or os.getenv("HUGGINGFACE_MODEL", "mistralai/Mistral-7B-Instruct-v0.1")
        
        if not api_key:
            logger.warning("⚠️ HUGGINGFACE_API_KEY not set")
            self.available = False
            return
        
        try:
            self.client = InferenceClient(api_key=api_key)
            self.model = model
            logger.info(f"✅ Hugging Face provider initialized: {model}")
        except Exception as e:
            logger.error(f"❌ Hugging Face init failed: {e}")
            self.available = False
    
    def generate_flashcards(self, topic: str, num_cards: int = 5) -> List[Dict]:
        if not self.available:
            raise Exception("Hugging Face provider not available")
        
        try:
            prompt = (
                f"Generate exactly {num_cards} flashcard Q&A pairs for: {topic}\n\n"
                "Return ONLY a JSON array:\n"
                '[{"question": "...", "answer": "..."}]\n'
            )
            
            response = self.client.text_generation(prompt, max_new_tokens=1024)
            text = response if isinstance(response, str) else response.get("generated_text", "")
            
            if not text:
                raise Exception("Empty response from Hugging Face")
            
            cards = self._parse_json_list(text)
            if not cards:
                raise Exception("Could not parse flashcard data")
            
            logger.info(f"✅ Generated {len(cards)} flashcards via Hugging Face")
            return cards
            
        except Exception as e:
            logger.error(f"❌ Hugging Face error: {str(e)[:200]}")
            raise
    
    def generate_study_plan(self, subject: str, level: str, days: int, hours_per_day: float) -> List[Dict]:
        if not self.available:
            raise Exception("Hugging Face provider not available")
        
        try:
            prompt = (
                f"Create a {days}-day study plan for {subject} (Level: {level}).\n"
                f"Total: {hours_per_day} hours per day.\n"
                "Return ONLY a JSON array:\n"
                '[{"day": 1, "topic": "...", "hours": 2}, ...]\n'
            )
            
            response = self.client.text_generation(prompt, max_new_tokens=2048)
            text = response if isinstance(response, str) else response.get("generated_text", "")
            
            plans = self._parse_json_list(text)
            if not plans:
                raise Exception("Could not parse plan data")
            
            logger.info(f"✅ Generated study plan via Hugging Face")
            return plans
            
        except Exception as e:
            logger.error(f"❌ Hugging Face study plan error: {str(e)[:200]}")
            raise
    
    def _parse_json_list(self, text: str) -> List[Dict]:
        """Extract and parse JSON array."""
        text = re.sub(r'^```json\s*', '', text)
        text = re.sub(r'^```\s*', '', text)
        text = re.sub(r'\s*```$', '', text)
        text = text.strip()
        
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if not match:
            return []
        
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            return []


class GroqProvider(AIProvider):
    """Groq API Provider - LLaMA 3, Mixtral (14,400 free req/day)"""

    def __init__(self, model_override: str = None):
        try:
            from groq import Groq
            self.Groq = Groq
            self.available = True
        except ImportError:
            logger.warning("⚠️ groq package not installed. Run: pip install groq")
            self.available = False
            return

        api_key = os.getenv("GROQ_API_KEY", "").strip()
        model = model_override or os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

        if not api_key:
            logger.warning("⚠️ GROQ_API_KEY not set")
            self.available = False
            return

        try:
            self.client = Groq(api_key=api_key)
            self.model = model
            logger.info(f"✅ Groq provider initialized: {model}")
        except Exception as e:
            logger.error(f"❌ Groq init failed: {e}")
            self.available = False

    def generate_flashcards(self, topic: str, num_cards: int = 5) -> List[Dict]:
        if not self.available:
            raise Exception("Groq provider not available")

        try:
            prompt = (
                f"Generate exactly {num_cards} flashcard Q&A pairs for: {topic}\n\n"
                "Return ONLY a JSON array with no extra text or markdown:\n"
                '[{"question": "...", "answer": "..."}]\n\n'
                "Requirements:\n"
                "- Questions should test understanding\n"
                "- Keep answers concise (1-2 sentences)\n"
                "- Valid JSON array only\n"
                "- Each object must have 'question' and 'answer' keys"
            )

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1024,
            )
            text = response.choices[0].message.content or ""

            if not text:
                raise Exception("Empty response from Groq")

            cards = self._parse_json_list(text)
            if not cards:
                raise Exception("Could not parse flashcard data from Groq response")

            logger.info(f"✅ Generated {len(cards)} flashcards via Groq")
            return cards

        except Exception as e:
            error_msg = str(e)
            if "rate_limit" in error_msg.lower() or "429" in error_msg:
                logger.error(f"❌ Groq rate limit hit: {error_msg[:150]}")
                raise Exception("Groq rate limit reached. Please wait and try again.")
            logger.error(f"❌ Groq flashcard error: {error_msg[:200]}")
            raise

    def generate_study_plan(self, subject: str, level: str, days: int, hours_per_day: float) -> List[Dict]:
        if not self.available:
            raise Exception("Groq provider not available")

        try:
            prompt = (
                f"Create a {days}-day study plan for {subject} (Level: {level}).\n"
                f"Total: {hours_per_day} hours per day.\n"
                "Return ONLY a JSON array:\n"
                '[{"day": 1, "topic": "...", "hours": 2, "details": "..."}, ...]\n'
            )

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=2048,
            )
            text = response.choices[0].message.content or ""

            if not text:
                raise Exception("Empty response from Groq")

            plans = self._parse_json_list(text)
            if not plans:
                raise Exception("Could not parse plan data from Groq response")

            logger.info(f"✅ Generated study plan via Groq")
            return plans

        except Exception as e:
            logger.error(f"❌ Groq study plan error: {str(e)[:200]}")
            raise

    def _parse_json_list(self, text: str) -> List[Dict]:
        """Extract and parse JSON array from response text."""
        text = re.sub(r'^```json\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'^```\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
        text = text.strip()

        match = re.search(r'\[.*\]', text, re.DOTALL)
        if not match:
            return []

        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            return []


# =============================================================================
# PROVIDER FACTORY
# =============================================================================

class AIStudyService:
    """Multi-provider AI Service - Automatically selects best available provider."""
    
    def __init__(self):
        provider_name = os.getenv("AI_PROVIDER", "gemini").lower()
        logger.info(f"Initializing AI provider: {provider_name}")
        
        # Try requested provider first, then fall back to others
        providers_to_try = []

        if provider_name == "groq":
            providers_to_try = [GroqProvider, GeminiProvider, OllamaProvider, HuggingFaceProvider]
        elif provider_name == "gemini":
            providers_to_try = [GeminiProvider, GroqProvider, OllamaProvider, HuggingFaceProvider]
        elif provider_name == "ollama":
            providers_to_try = [OllamaProvider, GroqProvider, GeminiProvider, HuggingFaceProvider]
        elif provider_name == "huggingface":
            providers_to_try = [HuggingFaceProvider, GroqProvider, GeminiProvider, OllamaProvider]
        else:
            providers_to_try = [GroqProvider, GeminiProvider, OllamaProvider, HuggingFaceProvider]
        
        self.provider = None
        for provider_class in providers_to_try:
            try:
                provider = provider_class()
                if provider.available:
                    self.provider = provider
                    break
            except Exception as e:
                logger.debug(f"Provider {provider_class.__name__} not available: {e}")
                continue
        
        if not self.provider:
            logger.warning("❌ No AI provider available!")
    
    def generate_flashcards(self, topic: str, num_cards: int = 5) -> List[Dict]:
        if not self.provider:
            raise Exception("No AI provider available. Configure GEMINI_API_KEY, set up Ollama, or add HUGGINGFACE_API_KEY")
        
        try:
            return self.provider.generate_flashcards(topic, num_cards)
        except Exception as e:
            logger.error(f"Flashcard generation failed: {str(e)}")
            raise
    
    def generate_study_plan(self, subject: str, level: str, days: int, hours_per_day: float) -> List[Dict]:
        if not self.provider:
            raise Exception("No AI provider available")
        
        try:
            return self.provider.generate_study_plan(subject, level, days, hours_per_day)
        except Exception as e:
            logger.error(f"Study plan generation failed: {str(e)}")
            raise


# =============================================================================
# SINGLETON INSTANCE
# =============================================================================

_ai_service_instance = None

def get_ai_service() -> AIStudyService:
    global _ai_service_instance
    if _ai_service_instance is None:
        _ai_service_instance = AIStudyService()
    return _ai_service_instance


# =============================================================================
# PER-REQUEST PROVIDER FACTORY
# =============================================================================

_PROVIDER_MAP = {
    "groq": GroqProvider,
    "gemini": GeminiProvider,
    "ollama": OllamaProvider,
    "huggingface": HuggingFaceProvider,
}

def get_provider_by_name(provider_name: str, model: str = None) -> Optional["AIProvider"]:
    """
    Instantiate a specific provider by name with an optional model override.
    Returns None if the provider is unavailable or misconfigured.
    Used for per-request provider selection from the frontend.
    """
    cls = _PROVIDER_MAP.get(provider_name.lower())
    if not cls:
        logger.warning(f"Unknown provider requested: {provider_name}")
        return None
    try:
        instance = cls(model_override=model) if model else cls()
        if instance.available:
            logger.info(f"✅ Per-request provider: {provider_name} / {model or 'default'}")
            return instance
        logger.warning(f"⚠️ Provider {provider_name} not available (check API key / config)")
        return None
    except Exception as e:
        logger.error(f"❌ Failed to init provider {provider_name}: {e}")
        return None
