import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { CalendarCheck, ListTodo, Clock, CheckCircle2, Plus, AlertTriangle, Flame, Hash } from "lucide-react"
import API from "../api/api"
import MeetingCard from "../components/MeetingCard"
import ActionCard from "../components/ActionCard"
import DashboardLayout from "../Layout/DashboardLayout"
import Loader from "../components/Loader"
import EmptyState from "../components/EmptyState"
import CountUp from "../components/fx/CountUp"
import { BarChart, Donut } from "../components/Charts"
import useUser from "../hooks/useUser"
import { btnPrimary, errorBox } from "../lib/ui"

function Stat({ label, value, icon: Icon, tone, i, suffix }) {

  return (

    <div className="glass glass-lift rise flex items-center gap-4 p-5" style={{ "--i": i }}>

      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
        <Icon size={21} />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-emerald-100/50">{label}</p>
        <p className="font-display text-3xl text-emerald-50"><CountUp value={value} suffix={suffix} /></p>
      </div>

    </div>

  )

}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"
}

export default function Dashboard(){

  const [user] = useUser()
  const [meetings, setMeetings] = useState([])
  const [actions, setActions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {

    try {

      const [m, a, s] = await Promise.all([API.get("/meetings"), API.get("/actions"), API.get("/stats/overview")])

      setMeetings(m.data)
      setActions(a.data)
      setStats(s.data)
      setError("")

    } catch {

      setError("Could not load your data. Please check that the server is running.")

    } finally {

      setLoading(false)

    }

  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openActions = actions.filter(a => a.status !== "Done")
  const first = user?.name?.split(" ")[0]

  return (

    <DashboardLayout
      title={`${greeting()}${first ? `, ${first}` : ""}`}
      subtitle="Here is what is happening across your meetings."
      actions={<Link to="/upload" className={btnPrimary}><Plus size={16} /> New meeting</Link>}
    >

      {loading ? <Loader /> : (

        <div className="space-y-10">

          {error && <p role="alert" className={errorBox}>{error}</p>}

          {stats && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat i={0} label="Meetings" value={stats.meetings} icon={CalendarCheck} tone="bg-emerald-400/15 text-emerald-300" />
                <Stat i={1} label="Pending" value={stats.pending} icon={Clock} tone="bg-amber-400/15 text-amber-300" />
                <Stat i={2} label="Overdue" value={stats.overdue} icon={AlertTriangle} tone="bg-rose-400/15 text-rose-300" />
                <Stat i={3} label="Completed" value={stats.done} icon={CheckCircle2} tone="bg-sky-400/15 text-sky-300" />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">

                <div className="glass rise p-5 lg:col-span-2" style={{ "--i": 4 }}>
                  <h2 className="mb-4 text-sm font-semibold text-emerald-50">Meetings per week</h2>
                  <BarChart data={stats.weekly.map(w => ({ label: w.week.slice(5), value: w.meetings }))} />
                </div>

                <div className="glass rise flex flex-col items-center p-5" style={{ "--i": 5 }}>
                  <h2 className="mb-4 self-start text-sm font-semibold text-emerald-50">Task completion</h2>
                  <Donut
                    segments={[
                      { value: stats.done, color: "#34d399" },
                      { value: stats.in_progress, color: "#38bdf8" },
                      { value: stats.pending, color: "#fbbf24" },
                    ]}
                    center={<><span className="font-display text-3xl text-emerald-50"><CountUp value={stats.completion_rate} suffix="%" /></span><span className="text-[10px] uppercase tracking-wider text-emerald-100/40">done</span></>}
                  />
                  <div className="mt-4 flex gap-4 text-xs text-emerald-100/55">
                    <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />Done</span>
                    <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-400" />Active</span>
                    <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />Pending</span>
                  </div>
                </div>

              </div>

              {(stats.top_topics.length > 0 || stats.due_soon.length > 0 || stats.top_owners.length > 0) && (
                <div className="grid gap-4 lg:grid-cols-3">

                  <div className="glass rise p-5" style={{ "--i": 6 }}>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-50"><Hash size={15} className="text-emerald-300" />Top topics</h2>
                    <div className="flex flex-wrap gap-2">
                      {stats.top_topics.length === 0 && <p className="text-sm text-emerald-100/40">No topics yet.</p>}
                      {stats.top_topics.map(t => <span key={t.topic} className="rounded-lg bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-200">{t.topic} · {t.count}</span>)}
                    </div>
                  </div>

                  <div className="glass rise p-5" style={{ "--i": 7 }}>
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-50"><Flame size={15} className="text-amber-300" />Due this week</h2>
                    {stats.due_soon.length === 0 && <p className="text-sm text-emerald-100/40">Nothing due in the next 7 days.</p>}
                    <ul className="space-y-2">
                      {stats.due_soon.map(d => <li key={d._id} className="flex justify-between gap-3 text-sm text-emerald-100/75"><span className="truncate">{d.task}</span><span className="shrink-0 text-xs text-amber-300">{d.deadline}</span></li>)}
                    </ul>
                  </div>

                  <div className="glass rise p-5" style={{ "--i": 8 }}>
                    <h2 className="mb-3 text-sm font-semibold text-emerald-50">Busiest owners</h2>
                    {stats.top_owners.length === 0 && <p className="text-sm text-emerald-100/40">No assigned tasks yet.</p>}
                    <ul className="space-y-2.5">
                      {stats.top_owners.map(o => (
                        <li key={o.owner} className="text-sm text-emerald-100/75">
                          <div className="mb-1 flex justify-between"><span>{o.owner}</span><span className="text-emerald-300">{o.open} open</span></div>
                          <div className="h-1.5 rounded bg-white/10"><div className="h-full rounded bg-gradient-to-r from-emerald-300 to-emerald-600" style={{ width: `${Math.min(100, o.open * 20)}%` }} /></div>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}
            </>
          )}

          <section>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl text-emerald-50">Recent meetings</h2>
              <Link to="/meetings" className="text-sm font-medium text-emerald-300 hover:underline">View all</Link>
            </div>

            {meetings.length === 0 ? (
              <EmptyState icon={CalendarCheck} title="No meetings yet" text="Create your first meeting and the AI will summarize it and extract action items." actionLabel="Create a meeting" actionTo="/upload" />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {meetings.slice(0, 6).map((m, i) => <MeetingCard key={m._id} meeting={m} index={i} />)}
              </div>
            )}

          </section>

          <section>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl text-emerald-50">Open action items</h2>
              <Link to="/actions" className="text-sm font-medium text-emerald-300 hover:underline">View all</Link>
            </div>

            {openActions.length === 0 ? (
              <EmptyState icon={ListTodo} title="No open action items" text="Action items extracted from your meetings will appear here." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {openActions.slice(0, 6).map((a, i) => <ActionCard key={a._id} action={a} refresh={fetchData} index={i} />)}
              </div>
            )}

          </section>

        </div>

      )}

    </DashboardLayout>

  )

}
