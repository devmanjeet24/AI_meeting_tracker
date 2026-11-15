import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Paperclip, Sparkles } from "lucide-react"
import API from "../api/api"
import DashboardLayout from "../Layout/DashboardLayout"
import { inputCls, labelCls, btnPrimary, btnSecondary, cardCls, errorMessage } from "../lib/ui"

export default function UploadNotes(){

  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [title, setTitle] = useState("")
  const [type, setType] = useState("Standup")
  const [participants, setParticipants] = useState("")
  const [notes, setNotes] = useState("")
  const [fileName, setFileName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Upload a .txt file and load its text into the notes field
  const handleFile = async (e) => {

    const file = e.target.files[0]

    if (!file) return

    setError("")

    try {

      const formData = new FormData()
      formData.append("file", file)

      const res = await API.post("/upload/notes", formData)

      setNotes(res.data.notes)
      setFileName(file.name)

    } catch (err) {

      setError(errorMessage(err, "The file could not be uploaded."))

    } finally {

      e.target.value = ""

    }

  }

  const submitMeeting = async (e) => {

    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Please enter a meeting title.")
      return
    }

    if (!notes.trim()) {
      setError("Please add meeting notes or upload a .txt file.")
      return
    }

    try {

      setLoading(true)

      await API.post("/meetings/process", {
        title: title.trim(),
        notes,
        participants: participants.split(",").map(p => p.trim()).filter(Boolean),
        type
      })

      navigate("/meetings")

    } catch (err) {

      setError(errorMessage(err, "The meeting could not be created. Please try again."))

    } finally {

      setLoading(false)

    }

  }

  return (

    <DashboardLayout
      title="New meeting"
      subtitle="Add your notes and the AI will generate a summary, decisions and action items."
    >

      <form onSubmit={submitMeeting} className={`${cardCls} max-w-3xl space-y-5 p-6`}>

        <div className="grid gap-5 sm:grid-cols-2">

          <div className="sm:col-span-2">
            <label htmlFor="title" className={labelCls}>Meeting title</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly product sync" className={inputCls} />
          </div>

          <div>
            <label htmlFor="type" className={labelCls}>Meeting type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              <option>Standup</option>
              <option>Planning</option>
              <option>Review</option>
            </select>
          </div>

          <div>
            <label htmlFor="participants" className={labelCls}>Participants</label>
            <input id="participants" value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Comma separated, e.g. Priya, Rahul" className={inputCls} />
          </div>

        </div>

        <div>

          <div className="mb-1.5 flex items-center justify-between">

            <label htmlFor="notes" className="text-sm font-medium text-slate-700">Meeting notes</label>

            <button type="button" onClick={() => fileRef.current?.click()} className={btnSecondary}>
              <Paperclip size={14} /> Upload .txt file
            </button>

            <input ref={fileRef} type="file" accept=".txt" onChange={handleFile} className="hidden" />

          </div>

          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={12}
            placeholder="Paste or type your meeting notes here"
            className={inputCls}
          />

          {fileName && <p className="mt-1.5 text-xs text-slate-500">Loaded from {fileName}</p>}

        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">

          {loading && <span className="text-sm text-slate-500">Analyzing notes, this can take a few seconds...</span>}

          <button type="submit" disabled={loading} className={btnPrimary}>
            <Sparkles size={16} />
            {loading ? "Processing..." : "Create meeting"}
          </button>

        </div>

      </form>

    </DashboardLayout>

  )

}
