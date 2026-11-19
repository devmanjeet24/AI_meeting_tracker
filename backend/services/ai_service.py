import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


def _chat(prompt, system=None):
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    response = client.chat.completions.create(model=MODEL, messages=messages)
    return response.choices[0].message.content or ""


def _json_from(text):
    start = text.find("{")
    end = text.rfind("}") + 1
    return json.loads(text[start:end])


def process_meeting_notes(notes):

    prompt = f"""
Analyze the following meeting notes.

Return JSON only in this format:

{{
"summary": "2-4 sentence summary",
"decisions": [],
"topics": ["3-6 short topic keywords"],
"sentiment": "Positive | Neutral | Negative | Mixed",
"risks": ["risks or blockers mentioned"],
"follow_up_email": "a short, polite follow-up email recap to attendees",
"action_items": [
{{
"task": "",
"owner": "",
"priority": "High | Medium | Low",
"deadline": "YYYY-MM-DD if a date is known, otherwise empty"
}}
]
}}

Meeting Notes:
{notes}
"""

    try:
        return _json_from(_chat(prompt))
    except Exception as e:
        print("Groq error:", e)
        return None


def ask_about_meeting(notes, summary, question, history=None):
    """Answer a question using only the meeting's content."""

    context = f"Summary:\n{summary or ''}\n\nFull notes:\n{notes}"
    convo = ""
    for turn in (history or [])[-6:]:
        convo += f"{turn.get('role', 'user')}: {turn.get('content', '')}\n"

    system = (
        "You answer questions about a single meeting using only the provided notes. "
        "If the answer is not in the notes, say so. Be concise."
    )
    prompt = f"{context}\n\nConversation so far:\n{convo}\nQuestion: {question}"

    try:
        return _chat(prompt, system).strip()
    except Exception as e:
        print("Groq error:", e)
        return None
