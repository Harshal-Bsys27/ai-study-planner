#!/usr/bin/env python
"""List available Gemini models"""
import os
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY")

try:
    from google import genai
    client = genai.Client(api_key=api_key)
    
    models = client.models.list()
    print(f"[OK] Found {len(models)} models:")
    for model in models:
        print(f"  - {model.name}: {model.display_name}")
        
except Exception as e:
    print(f"[ERROR] {e}")
