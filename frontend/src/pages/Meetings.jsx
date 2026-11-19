import { useEffect, useState } from "react"
import { CalendarCheck, Search, Pin } from "lucide-react"
import API from "../api/api"
import DashboardLayout from "../Layout/DashboardLayout"
import Loader from "../components/Loader"
import EmptyState from "../components/EmptyState"
import MeetingCard from "../components/MeetingCard"
import Field from "../components/fx/Field"
import { errorBox } from "../lib/ui"

const TYPES = ["All", "Standup", "Planning", "Review", "Retro", "1:1", "Client call"]

export default function Meetings() {

  const [meetings, setMeetings] = useState([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [pinnedOnly, setPinnedOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // server-side search over title, summary, notes, tags and participants (debounced)
  useEffect(() => {

    const t = setTimeout(async () => {

      try {

        const params = {}
        if (search.trim()) params.q = search.trim()
        if (typeFilter !== "All") params.type = typeFilter
        if (pinnedOnly) params.pinned = "true"

        const res = await API.get("/meetings", { params })
        setMeetings(res.data)
        setError("")

      } catch {

        setError("Could not load meetings. Please check that the server is running.")

      } finally {

        setLoading(false)

      }

    }, 250)

    return () => clearTimeout(t)

  }, [search, typeFilter, pinnedOnly])

  const filtering = search || typeFilter !== "All" || pinnedOnly

  return (

    <DashboardLayout title="Meeting history" subtitle="Search summaries, decisions, notes, tags and people across every meeting.">

      {error && <p role="alert" className={`${errorBox} mb-6`}>{error}</p>}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">

        <div className="relative flex-1 sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-emerald-100/40" />
          <Field placeholder="Search anything..." value={search} onChange={(e) => setSearch(e.target.value)} className="!pl-10" />
        </div>

        <button
          onClick={() => setPinnedOnly(p => !p)}
          className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition ${pinnedOnly ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-200" : "border-white/10 text-emerald-100/60 hover:bg-white/5"}`}
        >
          <Pin size={14} /> Pinned
        </button>

      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TYPES.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${typeFilter === t ? "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30" : "text-emerald-100/55 ring-1 ring-white/10 hover:bg-white/5"}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : meetings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={filtering ? "No matching meetings" : "No meetings yet"}
          text={filtering ? "Try a different search or filter." : "Create a meeting to see its summary here."}
          actionLabel={filtering ? undefined : "Create a meeting"}
          actionTo="/upload"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {meetings.map((m, i) => <MeetingCard key={m._id} meeting={m} index={Math.min(i, 12)} />)}
        </div>
      )}

    </DashboardLayout>

  )

}
