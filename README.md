# AI Meeting Tracker

Upload or paste meeting notes and the AI (Groq) generates a summary, decisions and action items.
Stack: React (Vite) + Flask + MongoDB.

## Requirements
- Python 3.12 or 3.13 (3.14+ is not supported by some dependencies)
- Node.js 18+
- A MongoDB database (Atlas or local) and a Groq API key

## Backend
```bash
cd backend
cp .env.example .env        # then fill in your values
python3.13 -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py               # http://localhost:5000
```
On macOS, port 5000 may be used by AirPlay Receiver. Either turn it off
(System Settings > General > AirDrop & Handoff > AirPlay Receiver) or run
`PORT=5001 python app.py` and set `VITE_API_BASE_URL` accordingly.

Environment variables (`backend/.env`):

| Name | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `GROQ_API_KEY` | Groq API key |
| `JWT_SECRET` | Long random string used to sign login tokens |
| `GROQ_MODEL` | Optional. Defaults to `openai/gpt-oss-20b` |

## Frontend
```bash
cd frontend
cp .env.example .env        # VITE_API_BASE_URL must point to the backend
npm install
npm run dev                 # http://localhost:5173
```
Production build: `npm run build` (output in `frontend/dist`).

## Usage
1. Create an account and sign in.
2. Open **New Meeting**, paste your notes or upload a `.txt` file, and create the meeting.
3. Review the summary and decisions under **Meeting History**.
4. Track tasks under **Action Items** (edit owner and deadline, change status).

Each user can only see their own data.

## Deployment (Render + Vercel)
**Backend (Render, Web Service):** root directory `backend`, build command `pip install -r requirements.txt`,
start command `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120 --workers 2`.
Set `MONGO_URI`, `GROQ_API_KEY`, `JWT_SECRET`, `CORS_ORIGINS` (your Vercel URL) and `PYTHON_VERSION=3.13.5`.
A ready-made `render.yaml` is included.

**Frontend (Vercel):** root directory `frontend`, framework preset Vite.
Set `VITE_API_BASE_URL` to the Render URL (no trailing slash).

In MongoDB Atlas, allow network access from `0.0.0.0/0` so Render can connect.
