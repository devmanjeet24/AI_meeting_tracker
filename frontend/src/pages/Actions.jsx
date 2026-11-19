import { useEffect, useState, useCallback, useMemo } from "react"
import { ListTodo, LayoutGrid, Columns3, Plus, Download, Search } from "lucide-react"
import API from "../api/api"
import ActionCard from "../components/ActionCard"
import DashboardLayout from "../Layout/DashboardLayout"
import Loader from "../components/Loader"
import EmptyState from "../components/EmptyState"
import Field from "../components/fx/Field"
import { useToast } from "../components/fx/Toast"
import { btnPrimary, btnSecondary, errorBox, errorMessage } from "../lib/ui"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

const STATUSES = ["Pending", "In Progress", "Done"]
const FILTERS = ["All", ...STATUSES, "Overdue"]
const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 }
const COLUMN_TONE = { "Pending": "bg-amber-300", "In Progress": "bg-sky-300", "Done": "bg-emerald-300" }

export default function Actions(){

  const toast = useToast()
  const [actions, setActions] = useState([])
  const [filter, setFilter] = useState("All")
  const [priority, setPriority] = useState("All")
  const [sort, setSort] = useState("newest")
  const [search, setSearch] = useState("")
  const [view, setView] = useState(() => localStorage.getItem("actions-view") || "board")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState("")

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ task: "", owner: "", priority: "Medium", deadline: "" })

  const fetchActions = useCallback(async () => {

    try {

      const res = await API.get("/actions")
      setActions(res.data)
      setError("")

    } catch {

      setError("Could not load action items. Please check that the server is running.")

    } finally {

      setLoading(false)

    }

  }, [])

  useEffect(() => { fetchActions() }, [fetchActions])

  const changeView = (v) => { setView(v); localStorage.setItem("actions-view", v) }

  const visible = useMemo(() => {

    const q = search.toLowerCase()

    let list = actions.filter(a =>
      (filter === "All" || (filter === "Overdue" ? a.overdue : a.status === filter)) &&
      (priority === "All" || a.priority === priority) &&
      (!q || a.task?.toLowerCase().includes(q) || a.owner?.toLowerCase().includes(q))
    )

    if (sort === "priority") list = [...list].sort((a, b) => (PRIORITY_RANK[a.priority] ?? 3) - (PRIORITY_RANK[b.priority] ?? 3))
    if (sort === "deadline") list = [...list].sort((a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999"))

    return list

  }, [actions, filter, priority, sort, search])

  const count = (f) => f === "All" ? actions.length : f === "Overdue" ? actions.filter(a => a.overdue).length : actions.filter(a => a.status === f).length

  const drop = async (e, status) => {

    e.preventDefault()
    setDragOver("")

    const id = e.dataTransfer.getData("text/plain")
    const a = actions.find(x => x._id === id)
    if (!a || a.status === status) return

    // optimistic update
    setActions(prev => prev.map(x => x._id === id ? { ...x, status } : x))

    try {
      await API.patch(`/actions/${id}`, { status })
      toast(`Moved to ${status}`)
    } catch (err) {
      toast(errorMessage(err, "Could not move the task."), "error")
      fetchActions()
    }

  }

  const create = async (e) => {

    e.preventDefault()
    if (!form.task.trim()) return

    try {
      await API.post("/actions", form)
      setForm({ task: "", owner: "", priority: "Medium", deadline: "" })
      setShowAdd(false)
      toast("Action added")
      fetchActions()
    } catch (err) {
      toast(errorMessage(err, "Could not add the action."), "error")
    }

  }

  const exportCsv = async () => {

    try {
      const res = await API.get("/actions/export", { responseType: "blob" })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement("a")
      a.href = url; a.download = "action-items.csv"; a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast(errorMessage(err, "Export failed."), "error")
    }

  }

  return (

    <DashboardLayout
      title="Action items"
      subtitle="Drag tasks across the board or switch to a list."
      actions={
        <div className="flex gap-2">
          <button onClick={exportCsv} className={btnSecondary}><Download size={15} /> CSV</button>
          <button onClick={() => setShowAdd(true)} className={btnPrimary}><Plus size={16} /> New action</button>
        </div>
      }
    >

      {loading ? <Loader /> : (

        <>

          {error && <p role="alert" className={`${errorBox} mb-6`}>{error}</p>}

          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">

            <div className="relative flex-1 lg:max-w-xs">
              <Search size={16} className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-emerald-100/40" />
              <Field placeholder="Search tasks or owners" value={search} onChange={(e) => setSearch(e.target.value)} className="!pl-10" />
            </div>

            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="field-input lg:w-40">
              <option value="All">All priorities</option>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>

            <select value={sort} onChange={(e) => setSort(e.target.value)} className="field-input lg:w-40">
              <option value="newest">Newest first</option>
              <option value="priority">By priority</option>
              <option value="deadline">By deadline</option>
            </select>

            <div className="flex rounded-xl border border-white/10 bg-black/20 p-1 lg:ml-auto">
              {[["board", Columns3], ["list", LayoutGrid]].map(([v, Icon]) => (
                <button key={v} onClick={() => changeView(v)} aria-label={`${v} view`}
                  className={`rounded-lg px-3 py-1.5 transition ${view === v ? "bg-emerald-400/15 text-emerald-200" : "text-emerald-100/45"}`}>
                  <Icon size={16} />
                </button>
              ))}
            </div>

          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${filter === f ? "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30" : "text-emerald-100/55 ring-1 ring-white/10 hover:bg-white/5"}`}>
                {f} <span className="ml-1 opacity-60">{count(f)}</span>
              </button>
            ))}
          </div>

          {actions.length === 0 ? (
            <EmptyState icon={ListTodo} title="No action items yet" text="Create a meeting and the AI will extract action items, or add one manually." actionLabel="Create a meeting" actionTo="/upload" />
          ) : view === "board" ? (

            <div className="grid gap-4 lg:grid-cols-3">
              {STATUSES.map(s => {
                const col = visible.filter(a => a.status === s)
                return (
                  <div key={s}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(s) }}
                    onDragLeave={() => setDragOver("")}
                    onDrop={(e) => drop(e, s)}
                    className={`min-h-[18rem] rounded-2xl border p-3 transition ${dragOver === s ? "border-emerald-300/50 bg-emerald-400/[0.06]" : "border-white/[0.07] bg-black/15"}`}
                  >
                    <div className="mb-3 flex items-center gap-2 px-1.5 text-sm font-semibold text-emerald-50">
                      <i className={`h-2 w-2 rounded-full ${COLUMN_TONE[s]}`} /> {s}
                      <span className="ml-auto rounded-full bg-white/10 px-2 text-xs text-emerald-100/60">{col.length}</span>
                    </div>
                    <div className="space-y-3">
                      {col.map((a, i) => <ActionCard key={a._id} action={a} refresh={fetchActions} index={Math.min(i, 8)} draggable compact />)}
                      {col.length === 0 && <p className="px-2 py-8 text-center text-xs text-emerald-100/30">Drop tasks here</p>}
                    </div>
                  </div>
                )
              })}
            </div>

          ) : visible.length === 0 ? (
            <EmptyState icon={ListTodo} title="No matching items" text="Try changing the filters." />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((a, i) => <ActionCard key={a._id} action={a} refresh={fetchActions} index={Math.min(i, 12)} />)}
            </div>
          )}

        </>

      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <form onSubmit={create} className="space-y-4">
            <DialogHeader><DialogTitle>New action item</DialogTitle></DialogHeader>
            <Field placeholder="What needs to be done?" value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <Field placeholder="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
              <Field type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <Field as="select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>High</option><option>Medium</option><option>Low</option>
            </Field>
            <DialogFooter>
              <button type="button" onClick={() => setShowAdd(false)} className={btnSecondary}>Cancel</button>
              <button className={btnPrimary}>Add action</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </DashboardLayout>

  )

}
