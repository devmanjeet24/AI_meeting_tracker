import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft, Pin, PinOff, Download, RefreshCw, Trash2, Copy, Send, Users, Pencil, Check, X,
  Sparkles, ListChecks, FileText, MessageSquare, Mail, AlertTriangle, Plus,
} from "lucide-react"
import API from "../api/api"
import DashboardLayout from "../Layout/DashboardLayout"
import Loader from "../components/Loader"
import ActionCard from "../components/ActionCard"
import Field from "../components/fx/Field"
import { useToast } from "../components/fx/Toast"
import { badgeCls, btnDanger, btnPrimary, btnSecondary, errorBox, errorMessage } from "../lib/ui"
import { sentimentTone } from "../components/MeetingCard"
import { formatDate } from "../utils/helpers"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const TABS = [
  { id: "summary", label: "Summary", icon: Sparkles },
  { id: "actions", label: "Actions", icon: ListChecks },
  { id: "ask", label: "Ask AI", icon: MessageSquare },
  { id: "email", label: "Follow-up", icon: Mail },
  { id: "notes", label: "Notes", icon: FileText },
]

export default function MeetingDetail() {

  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [m, setM] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tab, setTab] = useState("summary")
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [busy, setBusy] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const [chat, setChat] = useState([])
  const [question, setQuestion] = useState("")
  const [asking, setAsking] = useState(false)
  const chatEnd = useRef(null)

  const [tagInput, setTagInput] = useState("")
  const [newTask, setNewTask] = useState("")

  const load = useCallback(async () => {
    try {
      const res = await API.get(`/meetings/${id}`)
      setM(res.data); setTitle(res.data.title || ""); setError("")
    } catch (err) {
      setError(errorMessage(err, "Could not load this meeting."))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }) }, [chat, asking])

  const patch = async (changes, msg) => {
    try {
      await API.patch(`/meetings/${id}`, changes)
      setM(prev => ({ ...prev, ...changes }))
      if (msg) toast(msg)
      return true
    } catch (err) {
      toast(errorMessage(err, "Update failed."), "error")
      return false
    }
  }

  const saveTitle = async () => {
    if (title.trim() && await patch({ title: title.trim() }, "Title updated")) setEditing(false)
  }

  const addTag = async (e) => {
    e.preventDefault()
    const t = tagInput.trim().replace(/^#/, "")
    if (!t || m.tags?.includes(t)) { setTagInput(""); return }
    await patch({ tags: [...(m.tags || []), t] })
    setTagInput("")
  }

  const removeTag = (t) => patch({ tags: m.tags.filter(x => x !== t) })

  const regenerate = async () => {
    setBusy(true)
    try {
      await API.post(`/meetings/${id}/regenerate`)
      await load(); toast("Analysis regenerated")
    } catch (err) {
      toast(errorMessage(err, "Could not regenerate."), "error")
    } finally { setBusy(false) }
  }

  const exportMd = async () => {
    try {
      const res = await API.get(`/meetings/${id}/export`, { responseType: "blob" })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement("a")
      a.href = url; a.download = `${(m.title || "meeting").replace(/[^\w-]+/g, "_")}.md`; a.click()
      URL.revokeObjectURL(url)
    } catch (err) { toast(errorMessage(err, "Export failed."), "error") }
  }

  const copy = async (text, label) => {
    try { await navigator.clipboard.writeText(text); toast(`${label} copied`) }
    catch { toast("Copy failed", "error") }
  }

  const remove = async () => {
    try {
      await API.delete(`/meetings/${id}`)
      toast("Meeting deleted")
      navigate("/meetings")
    } catch (err) { toast(errorMessage(err, "Could not delete."), "error"); setConfirmDel(false) }
  }

  const ask = async (e) => {
    e.preventDefault()
    const q = question.trim()
    if (!q || asking) return
    const history = chat
    setChat(c => [...c, { role: "user", content: q }])
    setQuestion(""); setAsking(true)
    try {
      const res = await API.post(`/meetings/${id}/ask`, { question: q, history })
      setChat(c => [...c, { role: "assistant", content: res.data.answer }])
    } catch (err) {
      setChat(c => [...c, { role: "assistant", content: errorMessage(err, "Sorry, I could not answer that.") }])
    } finally { setAsking(false) }
  }

  const addAction = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return
    try {
      await API.post("/actions", { task: newTask.trim(), meeting_id: id })
      setNewTask(""); toast("Action added"); load()
    } catch (err) { toast(errorMessage(err, "Could not add action."), "error") }
  }

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>

  if (error || !m) {
    return (
      <DashboardLayout>
        <p role="alert" className={errorBox}>{error || "Meeting not found."}</p>
        <Link to="/meetings" className={`${btnSecondary} mt-4`}><ArrowLeft size={15} /> Back to meetings</Link>
      </DashboardLayout>
    )
  }

  const suggestions = ["What were the key decisions?", "Who owns what?", "What are the open risks?"]

  return (

    <DashboardLayout>

      <Link to="/meetings" className="mb-5 inline-flex items-center gap-1.5 text-sm text-emerald-100/50 transition hover:text-emerald-200">
        <ArrowLeft size={15} /> All meetings
      </Link>

      {/* header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        <div className="min-w-0 flex-1">

          {editing ? (
            <div className="flex max-w-xl items-center gap-2">
              <Field value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveTitle()} autoFocus />
              <button onClick={saveTitle} className={btnPrimary} aria-label="Save title"><Check size={16} /></button>
              <button onClick={() => { setEditing(false); setTitle(m.title || "") }} className={btnSecondary} aria-label="Cancel"><X size={16} /></button>
            </div>
          ) : (
            <h1 className="font-display text-3xl text-emerald-50 md:text-4xl">
              {m.title || "Untitled meeting"}
              <button onClick={() => setEditing(true)} aria-label="Edit title" className="ml-3 align-middle text-emerald-100/30 transition hover:text-emerald-300"><Pencil size={16} /></button>
            </h1>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-emerald-100/55">
            {m.type && <span className={`${badgeCls} bg-emerald-400/10 text-emerald-300 ring-emerald-300/25`}>{m.type}</span>}
            {m.sentiment && <span className={`${badgeCls} ${sentimentTone[m.sentiment] || sentimentTone.Neutral}`}>{m.sentiment}</span>}
            <span>{formatDate(m.created_at)}</span>
            {m.participants?.length > 0 && <span className="flex items-center gap-1.5"><Users size={14} />{m.participants.join(", ")}</span>}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {(m.tags || []).map(t => (
              <span key={t} className="group inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-xs text-emerald-100/70">
                #{t}<button onClick={() => removeTag(t)} aria-label={`Remove ${t}`} className="opacity-0 transition group-hover:opacity-100"><X size={11} /></button>
              </span>
            ))}
            <form onSubmit={addTag}>
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="+ add tag" className="w-24 rounded-md bg-transparent px-1 py-0.5 text-xs text-emerald-100 outline-none placeholder:text-emerald-100/30 focus:bg-white/5" />
            </form>
          </div>

        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => patch({ pinned: !m.pinned }, m.pinned ? "Unpinned" : "Pinned")} className={btnSecondary}>
            {m.pinned ? <PinOff size={15} /> : <Pin size={15} />} {m.pinned ? "Unpin" : "Pin"}
          </button>
          <button onClick={regenerate} disabled={busy} className={btnSecondary}>
            <RefreshCw size={15} className={busy ? "animate-spin" : ""} /> {busy ? "Working..." : "Regenerate"}
          </button>
          <button onClick={exportMd} className={btnSecondary}><Download size={15} /> Export</button>
          <button onClick={() => setConfirmDel(true)} className={`${btnSecondary} hover:!border-red-400/30 hover:!bg-red-500/10 hover:text-red-300`}><Trash2 size={15} /></button>
        </div>

      </div>

      {/* tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-1.5">
        {TABS.map(({ id: t, label, icon: Icon }) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${tab === t ? "bg-emerald-400/15 text-emerald-200 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.25)]" : "text-emerald-100/50 hover:text-emerald-100"}`}>
            <Icon size={15} /> {label}
            {t === "actions" && <span className="rounded-full bg-white/10 px-1.5 text-[10px]">{m.actions?.length || 0}</span>}
          </button>
        ))}
      </div>

      <div key={tab} className="page-in">

        {tab === "summary" && (
          <div className="grid gap-4 lg:grid-cols-3">

            <div className="glass p-6 lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Summary</h2>
                {m.summary && <button onClick={() => copy(m.summary, "Summary")} className="text-emerald-100/40 hover:text-emerald-200" aria-label="Copy summary"><Copy size={15} /></button>}
              </div>
              <p className="leading-relaxed text-emerald-50/85">{m.summary || "No summary available. Try regenerating."}</p>

              {m.decisions?.length > 0 && (
                <>
                  <h2 className="mb-3 mt-7 text-xs font-semibold uppercase tracking-wider text-emerald-300">Decisions</h2>
                  <ul className="space-y-2">
                    {m.decisions.map((d, i) => (
                      <li key={i} className="flex gap-3 text-sm text-emerald-50/80"><Check size={16} className="mt-0.5 shrink-0 text-emerald-300" />{d}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="glass p-5">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-300">Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {m.topics?.length ? m.topics.map(t => <span key={t} className="rounded-lg bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-200">{t}</span>) : <p className="text-sm text-emerald-100/40">None detected.</p>}
                </div>
              </div>
              <div className="glass p-5">
                <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300"><AlertTriangle size={13} />Risks &amp; blockers</h2>
                {m.risks?.length ? <ul className="space-y-2 text-sm text-emerald-50/75">{m.risks.map((r, i) => <li key={i}>• {r}</li>)}</ul> : <p className="text-sm text-emerald-100/40">No risks flagged.</p>}
              </div>
            </div>

          </div>
        )}

        {tab === "actions" && (
          <div>
            <form onSubmit={addAction} className="mb-5 flex max-w-xl gap-2">
              <Field value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add an action item for this meeting..." />
              <button className={btnPrimary}><Plus size={16} /> Add</button>
            </form>
            {m.actions?.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {m.actions.map((a, i) => <ActionCard key={a._id} action={{ ...a, meeting_title: undefined }} refresh={load} index={i} />)}
              </div>
            ) : <p className="text-sm text-emerald-100/50">No action items for this meeting yet.</p>}
          </div>
        )}

        {tab === "ask" && (
          <div className="glass flex h-[28rem] flex-col p-4">
            <div className="flex-1 space-y-3 overflow-y-auto p-2">
              {chat.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <MessageSquare size={28} className="text-emerald-300" />
                  <p className="text-sm text-emerald-100/55">Ask anything about this meeting. Answers come only from your notes.</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map(s => <button key={s} onClick={() => setQuestion(s)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-emerald-100/70 transition hover:border-emerald-300/30 hover:bg-white/5">{s}</button>)}
                  </div>
                </div>
              )}
              {chat.map((c, i) => (
                <div key={i} className={`flex ${c.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${c.role === "user" ? "bg-emerald-400/20 text-emerald-50" : "bg-white/[0.06] text-emerald-50/85"}`}>{c.content}</div>
                </div>
              ))}
              {asking && <div className="flex gap-1.5 px-2 py-3">{[0, 1, 2].map(i => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-emerald-300" style={{ animationDelay: `${i * 120}ms` }} />)}</div>}
              <div ref={chatEnd} />
            </div>
            <form onSubmit={ask} className="mt-3 flex gap-2">
              <Field value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question..." />
              <button disabled={asking || !question.trim()} className={btnPrimary} aria-label="Send"><Send size={16} /></button>
            </form>
          </div>
        )}

        {tab === "email" && (
          <div className="glass p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Follow-up email draft</h2>
              {m.follow_up_email && <button onClick={() => copy(m.follow_up_email, "Email")} className={btnSecondary}><Copy size={14} /> Copy</button>}
            </div>
            {m.follow_up_email
              ? <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-emerald-50/85">{m.follow_up_email}</pre>
              : <p className="text-sm text-emerald-100/50">No draft yet. Click Regenerate to create one.</p>}
          </div>
        )}

        {tab === "notes" && (
          <div className="glass p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Original notes</h2>
              <button onClick={() => copy(m.notes || "", "Notes")} className={btnSecondary}><Copy size={14} /> Copy</button>
            </div>
            <div className="max-h-[32rem] overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-emerald-50/80">{m.notes || "No notes."}</div>
          </div>
        )}

      </div>

      <Dialog open={confirmDel} onOpenChange={setConfirmDel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete meeting?</DialogTitle>
            <DialogDescription>&quot;{m.title}&quot; and its action items will be permanently deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setConfirmDel(false)} className={btnSecondary}>Cancel</button>
            <button onClick={remove} className={btnDanger}>Delete</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>

  )

}
