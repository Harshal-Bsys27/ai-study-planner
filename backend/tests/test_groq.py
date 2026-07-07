"""
Quick test script to verify Groq integration is working.
Run: python test_groq.py
"""
import sys
import os

# Fix Windows terminal encoding
sys.stdout.reconfigure(encoding="utf-8")

from dotenv import load_dotenv

load_dotenv(override=True)

print("=" * 55)
print("  Groq Integration Test")
print("=" * 55)

# 1. Check env vars
api_key  = os.getenv("GROQ_API_KEY", "")
model    = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
provider = os.getenv("AI_PROVIDER", "")

print(f"\n[Config]")
print(f"  AI_PROVIDER  = {provider}")
print(f"  GROQ_MODEL   = {model}")
if api_key and api_key != "your_groq_api_key_here":
    print(f"  GROQ_API_KEY = SET ({api_key[:8]}...)")
else:
    print(f"  GROQ_API_KEY = *** NOT SET or still placeholder ***")
    print("\n[STOP] Please set GROQ_API_KEY in your .env file first.")
    exit(1)

# 2. Test SDK import
print("\n[1] Testing groq package import...")
try:
    from groq import Groq
    print("    OK - groq SDK imported successfully")
except ImportError:
    print("    FAIL - groq not installed. Run: pip install groq")
    exit(1)

# 3. Test flashcard generation
print(f"\n[2] Testing flashcard generation (model: {model})...")
try:
    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model=model,
        messages=[{
            "role": "user",
            "content": (
                "Generate exactly 2 flashcard Q&A pairs for: Python Lists\n\n"
                "Return ONLY a JSON array:\n"
                '[{"question": "...", "answer": "..."}]'
            )
        }],
        temperature=0.7,
        max_tokens=256,
    )
    text = response.choices[0].message.content
    print("    OK - Response received!\n")
    print("    --- Output ---")
    for line in text.splitlines():
        print(f"    {line}")
    print(f"\n    Tokens: prompt={response.usage.prompt_tokens}, completion={response.usage.completion_tokens}")
except Exception as e:
    print(f"    FAIL - {e}")
    exit(1)

# 4. Test study plan generation
print(f"\n[3] Testing study plan generation...")
try:
    response2 = client.chat.completions.create(
        model=model,
        messages=[{
            "role": "user",
            "content": (
                "Create a 2-day study plan for Python (Level: Beginner).\n"
                "Total: 2 hours per day.\n"
                "Return ONLY a JSON array:\n"
                '[{"day": 1, "topic": "...", "hours": 2, "details": "..."}, ...]'
            )
        }],
        temperature=0.5,
        max_tokens=512,
    )
    text2 = response2.choices[0].message.content
    print("    OK - Study plan received!\n")
    print("    --- Output ---")
    for line in text2.splitlines():
        print(f"    {line}")
except Exception as e:
    print(f"    FAIL - {e}")
    exit(1)

print("\n" + "=" * 55)
print("  ALL TESTS PASSED - Groq is working!")
print("  Restart Flask backend, then test from the app.")
print("=" * 55)
