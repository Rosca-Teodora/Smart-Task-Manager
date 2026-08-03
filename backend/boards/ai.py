import json
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2"
PROMPT_TEMPLATE = """You are a helpful assistant that turns rough task ideas into structured tickets.
Given the user's rough input, respond with ONLY a JSON object with exactly these keys:
- "title": a short, clear task title (max 10 words)
- "description": a fuller description with any acceptance criteria you can infer
- "priority": one of "LOW", "MED", "HIGH"

Do not include any text outside the JSON object.

User input: {user_input}
"""

# use local ollama model 
# draft sentences to actual tasks
def draft_ticket(user_input: str) -> dict:
    prompt = PROMPT_TEMPLATE.format(user_input=user_input)

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "format": "json",   # constrain output to json only
                "stream": False,
            },
            timeout=60,
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"AI unavailable: {e}")

    
    raw = response.json().get("response", "")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise ValueError("AI returned malformed output")
    title = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()
    priority = str(data.get("priority", "MED")).upper()
    if priority not in {"LOW", "MED", "HIGH"}:
        priority = "MED"

    if not title:
        raise ValueError("AI did not return a usable title")
    return {"title": title, "description": description, "priority": priority}