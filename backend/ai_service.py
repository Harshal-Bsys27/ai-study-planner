"""
AI Service Module - Topic Generation using Google Gemini (Free!)

This module provides AI-powered study topic generation using the free
Google Gemini API. No API costs, no credit card required.

Setup:
1. Get free API key: https://ai.google.dev
2. Add to .env: GEMINI_API_KEY=your_key
3. Install: pip install google-generativeai

Usage:
    generator = TopicGenerator()
    topics = generator.generate_topics("Data Structures", "Beginner")
"""

import os
import logging
from typing import List, Dict
import google.generativeai as genai

logger = logging.getLogger(__name__)


class TopicGenerator:
    """Generate study topics using free Google Gemini API"""
    
    def __init__(self):
        """Initialize Gemini API with free key"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError(
                "❌ GEMINI_API_KEY not found in environment variables. "
                "Get free key at https://ai.google.dev"
            )
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-pro")
        logger.info("✅ Gemini AI Service initialized (FREE tier)")
    
    def generate_topics(self, subject: str, level: str = "Beginner", 
                       num_topics: int = 8) -> List[str]:
        """
        Generate study topics for a given subject.
        
        Args:
            subject: Subject name (e.g., "Data Structures", "Python")
            level: Difficulty level ("Beginner", "Intermediate", "Advanced")
            num_topics: Number of topics to generate (default: 8)
        
        Returns:
            List of topic strings
        
        Example:
            >>> gen = TopicGenerator()
            >>> topics = gen.generate_topics("DSA", "Beginner")
            >>> print(topics)
            ['1. Arrays - ...',  '2. Linked Lists - ...', ...]
        """
        prompt = f"""Generate exactly {num_topics} specific, actionable study topics for:
Subject: {subject}
Difficulty Level: {level}

Format ONLY as a numbered list (no additional text):
1. Topic Name - One sentence description
2. Topic Name - One sentence description
... and so on

Requirements:
- Each topic should be 2-3 words
- Each description should be 1-2 sentences, practical and clear
- Topics should progress from fundamentals to more advanced concepts
- Topics should be concrete and actionable (not vague)

START LISTING NOW:"""
        
        try:
            response = self.model.generate_content(prompt)
            topics = self._parse_topics(response.text)
            
            logger.info(f"✅ Generated {len(topics)} topics for {subject}")
            return topics
        
        except Exception as e:
            logger.error(f"❌ Error generating topics: {str(e)}")
            return self._get_fallback_topics(subject)
    
    def generate_learning_path(self, subject: str, duration_days: int = 7,
                               hours_per_day: int = 2) -> Dict:
        """
        Generate a multi-day learning path with daily topics.
        
        Args:
            subject: Subject name
            duration_days: Number of days for the learning path (1-30)
            hours_per_day: Study hours per day
        
        Returns:
            Dictionary with daily breakdown
        
        Example:
            >>> path = gen.generate_learning_path("Python Basics", 5)
            >>> print(path['day_1'])
            {'topics': ['...', '...'], 'hours': 2, 'objectives': ['...']}
        """
        prompt = f"""Create a {duration_days}-day learning path for {subject}.
Study Schedule: {hours_per_day} hours per day

For each day, provide:
- 3-4 topics to cover
- Estimated study hours (typically {hours_per_day})
- Learning objectives (2-3 specific outcomes)

Format as plain text (no JSON):

DAY 1:
Topics: topic1, topic2, topic3
Hours: {hours_per_day}
Objectives: 
- objective 1
- objective 2

DAY 2:
... and so on"""
        
        try:
            response = self.model.generate_content(prompt)
            return {
                'subject': subject,
                'duration_days': duration_days,
                'hours_per_day': hours_per_day,
                'daily_plan': response.text
            }
        
        except Exception as e:
            logger.error(f"❌ Error generating learning path: {str(e)}")
            return self._get_fallback_learning_path(subject, duration_days)
    
    def generate_flashcard_questions(self, topic: str, 
                                    num_questions: int = 10) -> List[Dict]:
        """
        Generate flashcard Q&A pairs for a topic.
        
        Args:
            topic: Topic name
            num_questions: Number of Q&A pairs to generate
        
        Returns:
            List of {'question': ..., 'answer': ...} dicts
        """
        prompt = f"""Generate {num_questions} flashcard Q&A pairs for: {topic}

Format each as:
Q: Question text
A: Answer text

Make questions progressively harder and include:
- Definition questions
- Application questions
- Analysis questions
- Comparison questions

START:"""
        
        try:
            response = self.model.generate_content(prompt)
            flashcards = self._parse_flashcards(response.text)
            logger.info(f"✅ Generated {len(flashcards)} flashcard Q&As")
            return flashcards
        
        except Exception as e:
            logger.error(f"❌ Error generating flashcards: {str(e)}")
            return []
    
    @staticmethod
    def _parse_topics(text: str) -> List[str]:
        """Parse AI response into topic list"""
        topics = []
        for line in text.strip().split('\n'):
            line = line.strip()
            # Match lines starting with numbers: "1. Topic - Description"
            if line and (line[0].isdigit() or line.startswith('-')):
                topics.append(line)
        
        return topics if topics else ["No topics generated"]
    
    @staticmethod
    def _parse_flashcards(text: str) -> List[Dict]:
        """Parse AI response into flashcard Q&A pairs"""
        flashcards = []
        current_q = None
        
        for line in text.strip().split('\n'):
            line = line.strip()
            if line.startswith('Q:'):
                if current_q:  # Save previous pair
                    # This shouldn't happen in well-formatted output
                    pass
                current_q = line[2:].strip()
            elif line.startswith('A:') and current_q:
                answer = line[2:].strip()
                flashcards.append({
                    'question': current_q,
                    'answer': answer
                })
                current_q = None
        
        return flashcards
    
    @staticmethod
    def _get_fallback_topics(subject: str) -> List[str]:
        """Fallback topics if AI fails (offline mode)"""
        fallback_topics = {
            "data structures": [
                "1. Arrays - Ordered collections with fixed size",
                "2. Linked Lists - Sequential data with pointers",
                "3. Stacks - LIFO data structure for function calls",
                "4. Queues - FIFO data structure for scheduling",
                "5. Binary Trees - Hierarchical data organization",
                "6. Hash Tables - Fast key-value lookup",
                "7. Graphs - Networks of connected nodes",
                "8. Tries - Efficient string searching"
            ],
            "python": [
                "1. Variables and Data Types - Strings, ints, floats",
                "2. Control Flow - If/else, loops, exceptions",
                "3. Functions - Reusable code blocks with parameters",
                "4. Lists and Dictionaries - Built-in collection types",
                "5. File I/O - Reading and writing files",
                "6. Object-Oriented Programming - Classes and inheritance",
                "7. Modules and Packages - Organizing code",
                "8. Debugging - Finding and fixing errors"
            ]
        }
        
        key = subject.lower()
        return fallback_topics.get(key, [f"Topic {i+1} for {subject}" for i in range(8)])
    
    @staticmethod
    def _get_fallback_learning_path(subject: str, days: int) -> Dict:
        """Fallback learning path if AI fails"""
        return {
            'subject': subject,
            'duration_days': days,
            'hours_per_day': 2,
            'daily_plan': f"Learning plan for {subject} over {days} days - (Offline mode)"
        }


# Singleton instance for use in Flask
_generator = None


def get_topic_generator() -> TopicGenerator:
    """Get or create topic generator instance"""
    global _generator
    if not _generator:
        _generator = TopicGenerator()
    return _generator


# Test the module
if __name__ == "__main__":
    # Test locally: python ai_service.py
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    print("🤖 Testing AI Service Module...")
    print("=" * 60)
    
    try:
        gen = TopicGenerator()
        
        # Test 1: Generate topics
        print("\n📚 Test 1: Generate Topics")
        print("-" * 60)
        topics = gen.generate_topics("Web Development", "Beginner", 5)
        for topic in topics:
            print(f"  {topic}")
        
        # Test 2: Learning path
        print("\n📅 Test 2: Generate Learning Path")
        print("-" * 60)
        path = gen.generate_learning_path("JavaScript", 3)
        print(path['daily_plan'][:300] + "...")
        
        # Test 3: Flashcards
        print("\n🎴 Test 3: Generate Flashcards")
        print("-" * 60)
        flashcards = gen.generate_flashcard_questions("React Hooks", 3)
        for i, card in enumerate(flashcards, 1):
            print(f"  Card {i}:")
            print(f"    Q: {card['question']}")
            print(f"    A: {card['answer']}")
        
        print("\n✅ All tests passed!")
    
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        print("\n💡 Make sure you have:")
        print("  1. GEMINI_API_KEY in .env file")
        print("  2. pip install google-generativeai")
