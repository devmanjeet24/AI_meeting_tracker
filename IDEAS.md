# AI Meeting Tracker — Ideas & Roadmap

Working notes: what the product should become, what is already built, what comes next.
Legend: ✅ built · 🚧 partial · 💡 idea

## 1. Design system ("Emerald Noir")
- ✅ One palette (deep emerald/dark green + mint accent), one font (Geist), one radius scale, glass cards, one motion language.
- ✅ Auth + app share the same floating glass shapes (full strength on auth, ~25% in app).
- ✅ Cursor FX: emerald spotlight, dot + trailing ring, magnetic buttons, 3D tilt on auth card, spotlight inside every glass card.
- ✅ Animated gradient focus border on inputs, staggered entrances, count-up numbers, cinematic login -> dashboard transition.
- ✅ Respects `prefers-reduced-motion` and touch devices (FX disabled there).
- 💡 Light theme toggle, accent colour picker.

## 2. Core features
| Feature | Status |
|---|---|
| Register / login (JWT) | ✅ |
| Paste notes or upload `.txt` -> AI summary, decisions, action items | ✅ |
| AI extras: topics, sentiment, risks/blockers, follow-up email draft | ✅ |
| Meeting detail page (summary / actions / notes / Ask AI / email tabs) | ✅ |
| Ask AI about a meeting (Q&A chat over the notes) | ✅ |
| Regenerate AI analysis for an existing meeting | ✅ |
| Edit title, type, participants, tags | ✅ |
| Pin / favourite meetings | ✅ |
| Tags on meetings + search across title, summary, notes, tags, people | ✅ |
| Export meeting as Markdown, actions as CSV | ✅ |
| Copy summary / follow-up email to clipboard | ✅ |
| Actions: list view + drag-and-drop Kanban board | ✅ |
| Actions: manual create, edit, delete, priority/owner/deadline | ✅ |
| Actions: filter by status/priority, search, sort, overdue flag | ✅ |
| Dashboard analytics: weekly meetings chart, status donut, completion rate, overdue, due soon, top owners, top topics, sentiment | ✅ |
| Profile page: change name, change password | ✅ |
| Command palette (Ctrl/Cmd + K) for navigation + meeting search | ✅ |
| Toast notifications | ✅ |
| Meeting templates (Standup / Planning / Retro / 1:1 / Client call) on the New Meeting page | ✅ |

## 3. Next ideas (not built yet)
- 💡 Audio upload + speech-to-text (Whisper on Groq) so people can drop a recording.
- 💡 `.docx` / `.pdf` / `.vtt` transcript upload.
- 💡 Email the follow-up draft directly (SMTP / Resend) and send deadline reminders.
- 💡 Calendar integration (Google Calendar import, add deadlines as events).
- 💡 Slack / Teams / Notion export of summaries and tasks.
- 💡 Team workspaces: invite members, shared meetings, assign tasks to real users, comments.
- 💡 Recurring meetings: carry over unfinished actions from the previous meeting automatically.
- 💡 Cross-meeting AI search ("what did we decide about pricing last month?") using embeddings.
- 💡 Speaker analytics (talk-time, who owns most tasks).
- 💡 Weekly digest email.
- 💡 Public share links (read-only summary).
- 💡 Password reset by email, Google sign-in, refresh tokens, rate limiting.
- 💡 Automated tests (pytest for API, Playwright for UI) + CI.

## 4. Technical notes
- Backend: Flask + MongoDB (Atlas) + Groq. New blueprints: `/stats`, extended `/meetings`, `/actions`, `/auth/me`, `/auth/password`.
- Deadlines from the AI are free text; the backend parses common date formats (`utils/dates.py`) to compute overdue / due-soon. The AI prompt now asks for `YYYY-MM-DD`.
- Cursor spotlight inside cards uses ONE delegated `pointermove` listener writing CSS variables — no per-card React state, so it stays 60fps.
- Troubleshooting: if the backend hangs on login with `SSL handshake failed` to `*.mongodb.net`, the current IP is not on the Atlas Network Access allow-list.
