import { useEffect, useState } from "react"
import { Trash2, FileText, Users, CalendarCheck, Search } from "lucide-react"
import API from "../api/api"
import DashboardLayout from "../Layout/DashboardLayout"
import Loader from "../components/Loader"
import EmptyState from "../components/EmptyState"
import { badgeCls, btnDanger, btnSecondary, cardCls, inputCls, errorMessage } from "../lib/ui"
import { formatDate } from "../utils/helpers"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Meetings() {

  const [meetings, setMeetings] = useState([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [notesMeeting, setNotesMeeting] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {

    const load = async () => {

      try {

        const res = await API.get("/meetings")
        setMeetings(res.data)

      } catch {

        setError("Could not load meetings. Please check that the server is running.")

      } finally {

        setLoading(false)

      }

    }

    load()

  }, [])

  const confirmDelete = async () => {

    setDeleting(true)

    try {

      await API.delete(`/meetings/${deleteTarget._id}`)

      setMeetings(prev => prev.filter(m => m._id !== deleteTarget._id))
      setDeleteTarget(null)

    } catch (err) {

      setError(errorMessage(err, "The meeting could not be deleted."))
      setDeleteTarget(null)

    } finally {

      setDeleting(false)

    }

  }

  const filtered = meetings.filter(m => {

    const q = search.toLowerCase()

    const matchSearch =
      m.title?.toLowerCase().includes(q) ||
      m.summary?.toLowerCase().includes(q)

    const matchType = typeFilter === "All" || m.type === typeFilter

    return matchSearch && matchType

  })

  return (

    <DashboardLayout
      title="Meeting history"
      subtitle="Browse summaries, decisions and notes from past meetings."
    >

      {loading ? <Loader /> : (

        <>

          {error && (
            <p role="alert" className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="mb-6 flex flex-col gap-3 sm:flex-row">

            <div className="relative flex-1 sm:max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search by title or summary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} pl-9`}
              />
            </div>

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={`${inputCls} sm:w-48`}>
              <option value="All">All types</option>
              <option value="Standup">Standup</option>
              <option value="Planning">Planning</option>
              <option value="Review">Review</option>
            </select>

          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title={meetings.length === 0 ? "No meetings yet" : "No matching meetings"}
              text={meetings.length === 0 ? "Create a meeting to see its summary here." : "Try a different search or filter."}
              actionLabel={meetings.length === 0 ? "Create a meeting" : undefined}
              actionTo="/upload"
            />
          ) : (

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

              {filtered.map(m => (

                <article key={m._id} className={`${cardCls} flex flex-col p-5`}>

                  <div className="mb-1 flex items-start justify-between gap-3">

                    <h3 className="font-semibold text-slate-900">{m.title || "Untitled meeting"}</h3>

                    {m.type && (
                      <span className={`${badgeCls} shrink-0 bg-indigo-50 text-indigo-700 ring-indigo-600/20`}>{m.type}</span>
                    )}

                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    {m.created_at && <span>{formatDate(m.created_at)}</span>}
                    {m.participants?.length > 0 && (
                      <span className="flex items-center gap-1"><Users size={13} />{m.participants.join(", ")}</span>
                    )}
                  </div>

                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Summary</h4>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{m.summary || "No summary available."}</p>

                  {m.decisions?.length > 0 && (
                    <>
                      <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Decisions</h4>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {m.decisions.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    </>
                  )}

                  <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">

                    <button onClick={() => setNotesMeeting(m)} className={btnSecondary}>
                      <FileText size={15} /> View notes
                    </button>

                    <button onClick={() => setDeleteTarget(m)} className={`${btnSecondary} text-red-600 hover:bg-red-50`} aria-label={`Delete ${m.title || "meeting"}`}>
                      <Trash2 size={15} /> Delete
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </>

      )}

      <Dialog open={!!notesMeeting} onOpenChange={(o) => !o && setNotesMeeting(null)}>

        <DialogContent className="max-w-2xl">

          <DialogHeader>
            <DialogTitle>{notesMeeting?.title || "Meeting notes"}</DialogTitle>
            <DialogDescription>Original meeting notes</DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto whitespace-pre-line text-sm text-slate-700">
            {notesMeeting?.notes || "No notes available for this meeting."}
          </div>

        </DialogContent>

      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>

        <DialogContent>

          <DialogHeader>
            <DialogTitle>Delete meeting?</DialogTitle>
            <DialogDescription>
              &quot;{deleteTarget?.title || "This meeting"}&quot; and its action items will be permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <button onClick={() => setDeleteTarget(null)} className={btnSecondary}>Cancel</button>
            <button onClick={confirmDelete} disabled={deleting} className={btnDanger}>
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>

        </DialogContent>

      </Dialog>

    </DashboardLayout>

  )

}
