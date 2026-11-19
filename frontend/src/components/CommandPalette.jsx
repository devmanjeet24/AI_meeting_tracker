import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LayoutDashboard, FilePlus2, ListTodo, History, UserCircle, CalendarCheck, Search } from "lucide-react"
import API from "../api/api"

const PAGES = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "New meeting", to: "/upload", icon: FilePlus2 },
  { label: "Meeting history", to: "/meetings", icon: History },
  { label: "Action items", to: "/actions", icon: ListTodo },
  { label: "Profile & settings", to: "/profile", icon: UserCircle },
]

export default function CommandPalette() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [meetings, setMeetings] = useState([])
  const [sel, setSel] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    const toggle = () => setOpen((o) => !o)
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); toggle() }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("open-palette", toggle)
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("open-palette", toggle) }
  }, [])

  useEffect(() => {
    if (!open) return
    setQ(""); setSel(0)
    setTimeout(() => inputRef.current?.focus(), 30)
    API.get("/meetings").then((r) => setMeetings(r.data)).catch(() => {})
  }, [open])

  const items = useMemo(() => {
    const t = q.toLowerCase()
    const pages = PAGES.filter((p) => p.label.toLowerCase().includes(t))
    const ms = meetings
      .filter((m) => !t || m.title?.toLowerCase().includes(t) || m.summary?.toLowerCase().includes(t))
      .slice(0, 6)
      .map((m) => ({ label: m.title || "Untitled meeting", to: `/meetings/${m._id}`, icon: CalendarCheck, hint: "Meeting" }))
    return [...pages, ...ms]
  }, [q, meetings])

  const go = (item) => { if (item) { setOpen(false); navigate(item.to) } }

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, items.length - 1)) }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
    if (e.key === "Enter") go(items[sel])
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center bg-black/60 px-4 pt-[15vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
      <div className="glass rise w-full max-w-lg overflow-hidden" style={{ "--i": 0 }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Search size={16} className="text-emerald-300" />
          <input
            ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setSel(0) }} onKeyDown={onKeyDown}
            placeholder="Type a page or meeting title..."
            className="h-12 w-full bg-transparent text-sm text-emerald-50 outline-none placeholder:text-emerald-100/30"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-emerald-100/40">No results</li>}
          {items.map((it, i) => (
            <li key={it.to + it.label}>
              <button
                onMouseEnter={() => setSel(i)} onClick={() => go(it)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${i === sel ? "bg-emerald-400/10 text-emerald-200" : "text-emerald-100/70"}`}
              >
                <it.icon size={16} /> <span className="truncate">{it.label}</span>
                {it.hint && <span className="ml-auto text-xs text-emerald-100/35">{it.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
