import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Paperclip, Sparkles, UploadCloud, Check } from "lucide-react"
import API from "../api/api"
import DashboardLayout from "../Layout/DashboardLayout"
import Field from "../components/fx/Field"
import Magnetic from "../components/fx/Magnetic"
import { useToast } from "../components/fx/Toast"
import { labelCls, btnPrimary, btnSecondary, errorBox, errorMessage } from "../lib/ui"

const TYPES = ["Standup", "Planning", "Review", "Retro", "1:1", "Client call"]

const TEMPLATES = {
  Standup: "Yesterday:\n- \n\nToday:\n- \n\nBlockers:\n- ",
  Planning: "Goal:\n\nScope:\n- \n\nDecisions:\n- \n\nAction items (owner, deadline):\n- ",
  Review: "What was reviewed:\n\nFeedback:\n- \n\nDecisions:\n- \n\nNext steps:\n- ",
  Retro: "What went well:\n- \n\nWhat did not:\n- \n\nImprovements (owner, deadline):\n- ",
  "1:1": "Updates:\n\nFeedback:\n\nGrowth / goals:\n\nFollow-ups:\n- ",
  "Client call": "Client:\n\nDiscussed:\n- \n\nClient requests:\n- \n\nCommitments (owner, deadline):\n- ",
}

const STEPS = ["Reading your notes", "Extracting decisions", "Finding action items", "Writing the summary"]

export default function UploadNotes(){

  const navigate = useNavigate()
  const toast = useToast()
  const fileRef = useRef(null)

  const [title, setTitle] = useState("")
  const [type, setType] = useState("Standup")
  const [participants, setParticipants] = useState("")
  const [tags, setTags] = useState("")
  const [notes, setNotes] = useState("")
  const [fileName, setFileName] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading) return
    const t = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 2200)
    return () => clearInterval(t)
  }, [loading])

  const uploadFile = async (file) => {

    if (!file) return
    setError("")

    try {

      const formData = new FormData()
      formData.append("file", file)

      const res = await API.post("/upload/notes", formData)

      setNotes(res.data.notes)
      setFileName(file.name)
      if (!title) setTitle(file.name.replace(/\.txt$/i, ""))
      toast("File loaded")

    } catch (err) {

      setError(errorMessage(err, "The file could not be uploaded."))

    }

  }

  const submitMeeting = async (e) => {

    e.preventDefault()
    setError("")

    if (!title.trim()) return setError("Please enter a meeting title.")
    if (!notes.trim()) return setError("Please add meeting notes or upload a .txt file.")

    try {

      setLoading(true); setStep(0)

      const res = await API.post("/meetings/process", {
        title: title.trim(),
        notes,
        participants: participants.split(",").map(p => p.trim()).filter(Boolean),
        tags: tags.split(",").map(p => p.trim().replace(/^#/, "")).filter(Boolean),
        type
      })

      toast("Meeting analysed")
      navigate(`/meetings/${res.data.meeting_id}`)

    } catch (err) {

      setError(errorMessage(err, "The meeting could not be created. Please try again."))
      setLoading(false)

    }

  }

  return (

    <DashboardLayout title="New meeting" subtitle="Add your notes and the AI will generate a summary, decisions, risks and action items.">

      <form onSubmit={submitMeeting} className="glass max-w-3xl space-y-6 p-6 md:p-8">

        <div className="grid gap-5 sm:grid-cols-2">

          <div className="sm:col-span-2">
            <label htmlFor="title" className={labelCls}>Meeting title</label>
            <Field id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly product sync" />
          </div>

          <div className="sm:col-span-2">
            <span className={labelCls}>Type</span>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button type="button" key={t} onClick={() => setType(t)}
                  className={`rounded-full px-4 py-1.5 text-sm transition ${type === t ? "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/40" : "text-emerald-100/55 ring-1 ring-white/10 hover:bg-white/5"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="participants" className={labelCls}>Participants</label>
            <Field id="participants" value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Priya, Rahul" />
          </div>

          <div>
            <label htmlFor="tags" className={labelCls}>Tags</label>
            <Field id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="roadmap, q4" />
          </div>

        </div>

        <div>

          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="notes" className="text-xs font-medium uppercase tracking-wider text-emerald-100/60">Meeting notes</label>
            <button type="button" onClick={() => setNotes(TEMPLATES[type])} className="text-xs text-emerald-300 hover:underline">Use {type} template</button>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); uploadFile(e.dataTransfer.files[0]) }}
            className={`rounded-2xl transition ${drag ? "ring-2 ring-emerald-300/60" : ""}`}
          >
            <Field as="textarea" id="notes" rows={12} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste or type your notes, or drop a .txt file here" />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-emerald-100/45">
            <span className="flex items-center gap-1.5">
              {fileName ? <><Check size={13} className="text-emerald-300" />Loaded from {fileName}</> : <><UploadCloud size={13} />Drag &amp; drop a .txt file</>}
            </span>
            <span>{notes.length.toLocaleString()} characters</span>
          </div>

          <button type="button" onClick={() => fileRef.current?.click()} className={`${btnSecondary} mt-3`}>
            <Paperclip size={14} /> Upload .txt file
          </button>
          <input ref={fileRef} type="file" accept=".txt" onChange={(e) => { uploadFile(e.target.files[0]); e.target.value = "" }} className="hidden" />

        </div>

        {error && <p role="alert" className={errorBox}>{error}</p>}

        {loading && (
          <ul className="space-y-2 rounded-xl border border-emerald-300/15 bg-emerald-400/[0.05] p-4 text-sm">
            {STEPS.map((s, i) => (
              <li key={s} className={`flex items-center gap-2.5 transition ${i <= step ? "text-emerald-100" : "text-emerald-100/25"}`}>
                {i < step ? <Check size={15} className="text-emerald-300" /> : i === step ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-300/30 border-t-emerald-300" /> : <span className="h-3.5 w-3.5" />}
                {s}
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end border-t border-white/[0.07] pt-6">
          <Magnetic>
            <button type="submit" disabled={loading} className={`${btnPrimary} px-6 py-3`}>
              <Sparkles size={16} /> {loading ? "Analysing..." : "Analyse meeting"}
            </button>
          </Magnetic>
        </div>

      </form>

    </DashboardLayout>

  )

}
