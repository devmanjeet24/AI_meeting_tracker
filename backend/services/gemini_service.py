import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def process_meeting_notes(notes):

    prompt = f"""
Analyze the following meeting notes.

Return JSON only in this format:

{{
"summary": "",
"decisions": [],
"action_items": [
{{
"task": "",
"owner": "",
"priority": "High | Medium | Low",
"deadline": ""
}}
]
}}

Meeting Notes:
{notes}
"""

    try:

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        text = response.choices[0].message.content

        start = text.find("{")
        end = text.rfind("}") + 1

        json_text = text[start:end]

        data = json.loads(json_text)

        return data

    except Exception as e:

        print("Groq error:", e)

        return {
            "summary": "AI processing failed",
            "decisions": [],
            "action_items": []
        }