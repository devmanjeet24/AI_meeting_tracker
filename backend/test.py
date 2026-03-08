from google import genai

client = genai.Client(api_key="AIzaSyCus6-dq0UBjllKWABlu3B_2RV6eoCmzr8")

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="Explain AI in one sentence"
)

print(response.text)