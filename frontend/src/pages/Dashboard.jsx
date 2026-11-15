import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { CalendarCheck, ListTodo, Clock, CheckCircle2, Plus, Search } from "lucide-react"
import API from "../api/api"
import MeetingCard from "../components/MeetingCard"
import ActionCard from "../components/ActionCard"
import DashboardLayout from "../Layout/DashboardLayout"
import Loader from "../components/Loader"
import EmptyState from "../components/EmptyState"
import { btnPrimary, cardCls, inputCls } from "../lib/ui"

function Stat({ label, value, icon: Icon, tone }) {

  return (

    <div className={`${cardCls} flex items-center gap-4 p-5`}>

      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}>
        <Icon size={20} />
      </div>

      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </div>

    </div>

  )

}

export default function Dashboard(){

  const [meetings, setMeetings] = useState([])
  const [actions, setActions] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {

    try {

      const [meetingsRes, actionsRes] = await Promise.all([
        API.get("/meetings"),
        API.get("/actions")
      ])

      setMeetings(meetingsRes.data)
      setActions(actionsRes.data)
      setError("")

    } catch {

      setError("Could not load your data. Please check that the server is running.")

    } finally {

      setLoading(false)

    }

  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const pending = actions.filter(a => a.status === "Pending").length
  const inProgress = actions.filter(a => a.status === "In Progress").length
  const done = actions.filter(a => a.status === "Done").length

  const filteredMeetings = meetings.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  )

  const openActions = actions.filter(a => a.status !== "Done")

  return (

    <DashboardLayout
      title="Dashboard"
      subtitle="An overview of your meetings and open action items."
      actions={
        <Link to="/upload" className={btnPrimary}>
          <Plus size={16} /> New meeting
        </Link>
      }
    >

      {loading ? <Loader /> : (

        <div className="space-y-10">

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Meetings" value={meetings.length} icon={CalendarCheck} tone="bg-indigo-50 text-indigo-600" />
            <Stat label="Pending" value={pending} icon={Clock} tone="bg-amber-50 text-amber-600" />
            <Stat label="In progress" value={inProgress} icon={ListTodo} tone="bg-blue-50 text-blue-600" />
            <Stat label="Completed" value={done} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
          </div>

          <section>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <h2 className="text-lg font-semibold text-slate-900">Recent meetings</h2>

              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search meetings"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputCls} pl-9`}
                />
              </div>

            </div>

            {filteredMeetings.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title={meetings.length === 0 ? "No meetings yet" : "No matching meetings"}
                text={meetings.length === 0 ? "Create your first meeting and the AI will summarize it and extract action items." : "Try a different search term."}
                actionLabel={meetings.length === 0 ? "Create a meeting" : undefined}
                actionTo="/upload"
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredMeetings.slice(0, 6).map(m => (
                  <MeetingCard key={m._id} meeting={m} />
                ))}
              </div>
            )}

          </section>

          <section>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Open action items</h2>
              <Link to="/actions" className="text-sm font-medium text-indigo-600 hover:underline">View all</Link>
            </div>

            {openActions.length === 0 ? (
              <EmptyState
                icon={ListTodo}
                title="No open action items"
                text="Action items extracted from your meetings will appear here."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {openActions.slice(0, 6).map(a => (
                  <ActionCard key={a._id} action={a} refresh={fetchData} />
                ))}
              </div>
            )}

          </section>

        </div>

      )}

    </DashboardLayout>

  )

}
