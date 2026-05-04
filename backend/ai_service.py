"""
AI Service Module - LangChain + Google Gemini Integration

Features:
- AI-powered study plan generation (structured JSON via LangChain)
- Topic generation per subject/level
- Flashcard Q&A generation

Setup:
1. Get free Gemini API key: https://ai.google.dev
2. Add to .env: GEMINI_API_KEY=your_key_here
3. pip install langchain langchain-google-genai langchain-core google-generativeai
"""

import os
import json
import logging
import re
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# LangChain imports (with graceful fallback if not installed)
# ---------------------------------------------------------------------------
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import StrOutputParser
    LANGCHAIN_AVAILABLE = True
    logger.info("✅ LangChain + Gemini loaded")
except ImportError:
    LANGCHAIN_AVAILABLE = False
    logger.warning("⚠️  LangChain not installed — falling back to google-generativeai")

# Fallback: raw google-generativeai
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.warning("⚠️  google-generativeai not installed either — AI features disabled")


# ---------------------------------------------------------------------------
# LangChain-based AI Service
# ---------------------------------------------------------------------------

class AIStudyService:
    """
    LangChain + Gemini powered study assistant.
    Provides:
      - generate_study_plan()   → full day-by-day plan as list of dicts
      - generate_topics()       → list of topic strings
      - generate_flashcards()   → list of {question, answer} dicts
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.llm = None
        self._init_llm()

    def _init_llm(self):
        if not self.api_key:
            logger.warning("⚠️  GEMINI_API_KEY not set — AI features will use fallback")
            return

        if LANGCHAIN_AVAILABLE:
            try:
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-1.5-flash",
                    google_api_key=self.api_key,
                    temperature=0.7,
                    convert_system_message_to_human=True,
                )
                logger.info("✅ LangChain ChatGoogleGenerativeAI initialized")
            except Exception as e:
                logger.error(f"❌ LangChain LLM init failed: {e}")
                self.llm = None
        elif GENAI_AVAILABLE:
            genai.configure(api_key=self.api_key)
            self.llm = genai.GenerativeModel("gemini-1.5-flash")
            logger.info("✅ google-generativeai fallback initialized")

    # -----------------------------------------------------------------------
    # PUBLIC: Generate full study plan (LangChain chain)
    # -----------------------------------------------------------------------
    def generate_study_plan(
        self,
        subject: str,
        level: str,
        days: int,
        hours_per_day: float,
    ) -> List[Dict]:
        """
        Generate a structured day-by-day study plan using LangChain + Gemini.

        Returns:
            List of day dicts:
            [
              {
                "day": 1,
                "topics": [
                  {"name": "Arrays - Indexing and slicing", "completed": false, "hours": 1.0},
                  ...
                ]
              },
              ...
            ]
        """
        if not self.llm:
            logger.warning("LLM not available — using static fallback plan")
            return self._fallback_plan(subject, level, days, hours_per_day)

        # --- Build LangChain prompt ---
        prompt_template = ChatPromptTemplate.from_messages([
            (
                "system",
                (
                    "You are an expert study plan designer. "
                    "Always respond with valid JSON only — no markdown, no explanation. "
                    "The JSON must be a list of day objects."
                ),
            ),
            (
                "human",
                """Create a {days}-day study plan for:
Subject: {subject}
Level: {level}
Hours per day: {hours} hours

Return ONLY a valid JSON array. Each element must have this exact structure:
{{
  "day": <integer day number starting at 1>,
  "topics": [
    {{"name": "<topic name - short description>", "completed": false, "hours": <float>}},
    ...
  ]
}}

Rules:
- Topics per day: 2-3 (distribute hours evenly across topics)
- Topic names should be specific and actionable (e.g. "Binary Search - Iterative & Recursive")
- Total hours in each day must equal {hours}
- Progress from fundamentals to advanced across the {days} days
- Return ONLY the JSON array, nothing else.
""",
            ),
        ])

        chain = prompt_template | self.llm | StrOutputParser()

        try:
            raw = chain.invoke({
                "subject": subject,
                "level": level,
                "days": days,
                "hours": hours_per_day,
            })
            plan = self._parse_json_plan(raw, days, hours_per_day)
            logger.info(f"✅ AI generated {len(plan)}-day plan for {subject} [{level}]")
            return plan

        except Exception as e:
            logger.error(f"❌ AI plan generation failed: {e}")
            return self._fallback_plan(subject, level, days, hours_per_day)

    # -----------------------------------------------------------------------
    # PUBLIC: Generate topic list
    # -----------------------------------------------------------------------
    def generate_topics(self, subject: str, level: str, num_topics: int = 8) -> List[str]:
        """Generate a list of topic strings for a subject/level."""
        if not self.llm:
            return self._fallback_topics(subject, level)

        prompt_template = ChatPromptTemplate.from_messages([
            ("system", "You are a study curriculum expert. Return only a numbered list."),
            ("human", (
                "List exactly {num} specific study topics for:\n"
                "Subject: {subject}\nLevel: {level}\n\n"
                "Format: one topic per line as:\n"
                "1. Topic Name - Brief description\n"
                "Return only the numbered list."
            )),
        ])
        chain = prompt_template | self.llm | StrOutputParser()

        try:
            raw = chain.invoke({"subject": subject, "level": level, "num": num_topics})
            topics = [
                line.strip()
                for line in raw.strip().split("\n")
                if line.strip() and (line.strip()[0].isdigit() or line.strip().startswith("-"))
            ]
            return topics if topics else self._fallback_topics(subject, level)
        except Exception as e:
            logger.error(f"❌ Topic generation failed: {e}")
            return self._fallback_topics(subject, level)

    # -----------------------------------------------------------------------
    # PUBLIC: Generate flashcards
    # -----------------------------------------------------------------------
    def generate_flashcards(self, topic: str, num_cards: int = 5) -> List[Dict]:
        """
        Auto-generate flashcard Q&A pairs for a topic using Gemini.

        Returns:
            [{"question": "...", "answer": "..."}, ...]
        """
        if not self.llm:
            return []

        prompt_template = ChatPromptTemplate.from_messages([
            ("system", "You are a flashcard creator. Return only valid JSON."),
            ("human", (
                "Generate {num} flashcard Q&A pairs for the topic: {topic}\n\n"
                "Return ONLY a JSON array:\n"
                '[{{"question": "...", "answer": "..."}}, ...]\n'
                "Make questions test understanding, not just recall."
            )),
        ])
        chain = prompt_template | self.llm | StrOutputParser()

        try:
            raw = chain.invoke({"topic": topic, "num": num_cards})
            cards = self._parse_json_list(raw)
            logger.info(f"✅ Generated {len(cards)} flashcards for '{topic}'")
            return cards
        except Exception as e:
            logger.error(f"❌ Flashcard generation failed: {e}")
            return []

    # -----------------------------------------------------------------------
    # PRIVATE: Parse LLM JSON output → list of day dicts
    # -----------------------------------------------------------------------
    def _parse_json_plan(self, raw: str, days: int, hours: float) -> List[Dict]:
        """Extract and validate JSON plan from LLM response."""
        # Strip markdown code fences if present
        cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("```").strip()

        try:
            data = json.loads(cleaned)
            if isinstance(data, list):
                validated = []
                for i, day_obj in enumerate(data):
                    day_num = day_obj.get("day", i + 1)
                    topics = day_obj.get("topics", [])
                    if not isinstance(topics, list):
                        topics = []
                    # Ensure each topic has required fields
                    clean_topics = []
                    for t in topics:
                        if isinstance(t, dict) and "name" in t:
                            clean_topics.append({
                                "name": str(t["name"]),
                                "completed": False,
                                "hours": float(t.get("hours", hours / max(len(topics), 1))),
                            })
                    validated.append({"day": day_num, "topics": clean_topics})
                return validated
        except (json.JSONDecodeError, ValueError, TypeError) as e:
            logger.warning(f"⚠️  JSON parse failed ({e}), using fallback")

        return self._fallback_plan("Unknown", "Beginner", days, hours)

    def _parse_json_list(self, raw: str) -> List[Dict]:
        """Parse a JSON list from LLM output."""
        cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("```").strip()
        try:
            data = json.loads(cleaned)
            if isinstance(data, list):
                return data
        except Exception:
            pass
        return []

    # -----------------------------------------------------------------------
    # PRIVATE: Fallback plan (static, no API needed)
    # -----------------------------------------------------------------------
    @staticmethod
    def _fallback_plan(subject: str, level: str, days: int, hours: float) -> List[Dict]:
        """Return a generic plan when AI is unavailable."""
        hours_per_topic = round(hours / 2, 1)
        return [
            {
                "day": day,
                "topics": [
                    {"name": f"{subject} - Topic {day}.{t}", "completed": False, "hours": hours_per_topic}
                    for t in range(1, 3)
                ],
            }
            for day in range(1, days + 1)
        ]

    @staticmethod
    def _fallback_topics(subject: str, level: str) -> List[str]:
        """Return generic topics when AI is unavailable."""
        return [
            f"1. {subject} Fundamentals - Core concepts and principles",
            f"2. {subject} Intermediate - Building on basics",
            f"3. {subject} Advanced - Complex topics and applications",
            f"4. {subject} Practice - Exercises and projects",
        ]


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------
_service: Optional[AIStudyService] = None


def get_ai_service() -> AIStudyService:
    """Get or create the AI service singleton."""
    global _service
    if _service is None:
        _service = AIStudyService()
    return _service


# ---------------------------------------------------------------------------
# Quick test
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

    print("🤖 Testing LangChain AI Service...")
    svc = AIStudyService()

    plan = svc.generate_study_plan("DSA", "Beginner", days=3, hours_per_day=2)
    print("\n📅 Generated Plan:")
    for day in plan:
        print(f"  Day {day['day']}:")
        for t in day["topics"]:
            print(f"    - {t['name']} ({t['hours']}h)")

    cards = svc.generate_flashcards("Binary Search Trees", num_cards=3)
    print("\n🃏 Generated Flashcards:")
    for c in cards:
        print(f"  Q: {c.get('question')}")
        print(f"  A: {c.get('answer')}\n")
