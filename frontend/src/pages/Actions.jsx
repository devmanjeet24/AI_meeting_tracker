import { useEffect, useState, useCallback } from "react"
import { ListTodo } from "lucide-react"
import API from "../api/api"
import ActionCard from "../components/ActionCard"
import DashboardLayout from "../Layout/DashboardLayout"
import Loader from "../components/Loader"
import EmptyState from "../components/EmptyState"

const FILTERS = ["All", "Pending", "In Progress", "Done"]

export default function Actions(){

  const [actions, setActions] = useState([])
  const [filter, setFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

  useEffect(() => {
    fetchActions()
  }, [fetchActions])

  const visible = filter === "All" ? actions : actions.filter(a => a.status === filter)

  const count = (f) => f === "All" ? actions.length : actions.filter(a => a.status === f).length

  return (

    <DashboardLayout
      title="Action items"
      subtitle="Track tasks extracted from your meetings."
    >

      {loading ? <Loader /> : (

        <>

          {error && (
            <p role="alert" className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="mb-6 flex flex-wrap gap-2">

            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f} <span className="ml-1 opacity-70">{count(f)}</span>
              </button>
            ))}

          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title={actions.length === 0 ? "No action items yet" : `No ${filter.toLowerCase()} items`}
              text={actions.length === 0 ? "Create a meeting and the AI will extract action items for you." : undefined}
              actionLabel={actions.length === 0 ? "Create a meeting" : undefined}
              actionTo="/upload"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map(a => (
                <ActionCard key={a._id} action={a} refresh={fetchActions} />
              ))}
            </div>
          )}

        </>

      )}

    </DashboardLayout>

  )

}
