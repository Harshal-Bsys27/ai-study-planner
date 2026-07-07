#!/usr/bin/env python
"""Test Gemini API directly"""
import os
import json
from dotenv import load_dotenv

load_dotenv(override=True)

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key set: {bool(api_key)}")
print(f"API Key (first 20 chars): {api_key[:20] if api_key else 'None'}")

try:
    from google import genai
    print("[OK] google-genai imported")
    
    client = genai.Client(api_key=api_key)
    print("[OK] genai client initialized")
    
    # Test 1: Simple call
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Say 'test successful'"
    )
    print(f"[OK] Simple API call successful: {response.text[:50]}")
    
    # Test 2: JSON generation
    prompt = (
        "Generate 2 flashcard Q&A pairs for: Python Variables\n\n"
        "Return ONLY a JSON array with no extra text:\n"
        '[{"question": "...", "answer": "..."}]\n'
    )
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    text = response.text
    print(f"\n[RESPONSE] (first 300 chars):\n{text[:300]}")
    
    # Try to parse JSON
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()
    
    try:
        data = json.loads(cleaned)
        print(f"\n[OK] JSON parsed successfully: {len(data)} items")
        print(f"Data: {json.dumps(data, indent=2)}")
    except json.JSONDecodeError as je:
        print(f"\n[ERROR] JSON parse failed: {je}")
        print(f"Cleaned text: {cleaned}")
        
except Exception as e:
    import traceback
    print(f"[ERROR] {type(e).__name__}: {str(e)[:200]}")
    traceback.print_exc()
