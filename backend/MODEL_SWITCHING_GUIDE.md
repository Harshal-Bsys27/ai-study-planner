# AI Model Switching Guide

The AI Study Planner now supports **4 different AI providers** - switch between them by editing `.env`

## Quick Switch Options

### 1. **Gemini API** (Google) - Current Default ✅
**Cost:** FREE tier (limited)  
**Speed:** Fast  
**Quality:** Excellent  

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

Get free key: https://ai.google.dev

⚠️ **Note:** Free tier has daily quota limits (~100 requests/day). After hitting limit, wait 24h for reset.

---

### 2. **Ollama** (Local) - Best for Development 🚀
**Cost:** FREE (100% free, no API key)  
**Speed:** Medium (depends on PC)  
**Quality:** Good  
**Requires:** Ollama app installed locally

**Setup:**
1. Download & install from: https://ollama.ai
2. Open terminal and run:
   ```bash
   ollama pull llama2  # or: ollama pull mistral
   ```
3. Ollama will run on `http://localhost:11434`
4. Update `.env`:
   ```env
   AI_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama2
   ```

**Available Models:**
- `llama2` - Fast, good for flashcards
- `mistral` - Faster, similar quality
- `neural-chat` - Optimized for chat

---

### 3. **Hugging Face** (Inference API) - Good for Deployment 📦
**Cost:** FREE tier (limited)  
**Speed:** Fast  
**Quality:** Good  

**Setup:**
1. Get free API key: https://huggingface.co/settings/tokens
2. Update `.env`:
   ```env
   AI_PROVIDER=huggingface
   HUGGINGFACE_API_KEY=your_token_here
   HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.1
   ```

**Available Models:**
- `mistralai/Mistral-7B-Instruct-v0.1` - Recommended
- `meta-llama/Llama-2-7b-chat-hf`
- `tiiuae/falcon-7b-instruct`

---

### 4. **OpenAI** (GPT-4) - Premium Option 💎
**Cost:** PAID ($0.01-0.03 per request)  
**Speed:** Fastest  
**Quality:** Best  

**Setup:**
1. Get API key: https://platform.openai.com/account/api-keys
2. Add credit card to account
3. Update `.env`:
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_api_key_here
   OPENAI_MODEL=gpt-4-turbo
   ```

---

## How Fallback Works

The app tries providers in this order:
1. **Requested provider** (from `AI_PROVIDER`)
2. **Gemini** (if available)
3. **Ollama** (if available)
4. **Hugging Face** (if available)

So even if you specify a provider that's not available, it will automatically try the others!

---

## Recommended Setup by Scenario

| Scenario | Provider | Why |
|----------|----------|-----|
| Learning / Testing | **Ollama** | Free, unlimited, no API key needed |
| Quick testing | **Gemini** | Already configured, just wait 24h if quota hit |
| Production (cheap) | **Hugging Face** | Free tier for testing, cheap scaling |
| Production (best quality) | **OpenAI** | Best results, small cost |

---

## Switching Between Providers (Examples)

### Switch to Ollama
```bash
cd backend
ollama pull llama2  # Start local Ollama
# Edit .env:
# AI_PROVIDER=ollama
# Restart Flask app
```

### Switch to Hugging Face
```bash
# Edit .env:
# AI_PROVIDER=huggingface
# HUGGINGFACE_API_KEY=hf_xxxxxx
# Restart Flask app
```

### Back to Gemini
```bash
# Edit .env:
# AI_PROVIDER=gemini
# GEMINI_API_KEY=AIzaSyxxxx
# Restart Flask app
```

---

## Troubleshooting

**"No AI provider available"**
- Check all APIs are unconfigured
- Make sure at least one of: Gemini API key, Ollama running, or Hugging Face key is set
- Check logs: `python app.py` (look for ✅ or ❌ messages)

**"API quota exceeded"**
- If using Gemini: Wait 24 hours for free tier reset
- Switch to Ollama (never has quota)

**"Connection refused"**
- If using Ollama: Make sure Ollama app is running (`ollama serve`)
- Check `OLLAMA_BASE_URL` matches your setup (default: `http://localhost:11434`)

**Slow responses**
- Ollama: Depends on your PC performance. Smaller models are faster.
- Hugging Face: Free tier may have longer queue times during peak hours
- Gemini: Should be fast, check internet connection

---

## Environment Variables Reference

```bash
# Core setting
AI_PROVIDER=gemini  # or: ollama, huggingface, openai

# Gemini options
GEMINI_API_KEY=AIzaSyxxxxx
GEMINI_MODEL=gemini-2.0-flash

# Ollama options
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Hugging Face options
HUGGINGFACE_API_KEY=hf_xxxxxx
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.1

# OpenAI options
OPENAI_API_KEY=sk-xxxxxx
OPENAI_MODEL=gpt-4-turbo
```
