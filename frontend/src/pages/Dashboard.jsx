import { useEffect, useState } from "react"
import API from "../api/api"
import MeetingCard from "../components/MeetingCard"
import ActionCard from "../components/ActionCard"
import DashboardLayout from "../Layout/DashboardLayout"
import Loader from "../components/Loader"

export default function Dashboard(){

  const [meetings,setMeetings] = useState([])
  const [actions,setActions] = useState([])
  const [search,setSearch] = useState("")
  const [loading,setLoading] = useState(true)

  const fetchData = async()=>{

    try{

      const meetingsRes = await API.get("/meetings")
      const actionsRes = await API.get("/actions")

      setMeetings(meetingsRes.data)
      setActions(actionsRes.data)

    }catch(err){

      console.log("Dashboard fetch error:",err)

    }finally{
      setLoading(false)
    }

  }

  useEffect(()=>{
    fetchData()
  },[])

  if(loading){
    return <Loader />
  }

  const pendingTasks = actions.filter(a=>a.status==="Pending")
  const completedTasks = actions.filter(a=>a.status==="Done")

  const filteredMeetings = meetings.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase())
  )

  return(

    <DashboardLayout>

    <div className="min-h-screen bg-slate-50 p-6 md:p-8">

      {/* Page Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">

        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          AI Meeting Tracker Dashboard
        </h1>

        {/* Search */}

        <input
          type="text"
          placeholder="Search meetings..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 mt-4 md:mt-0 w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

      </div>


      {/* Analytics Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
          <p className="text-gray-500 text-sm">Total Meetings</p>
          <h3 className="text-3xl font-bold text-indigo-600 mt-2">
            {meetings.length}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
          <p className="text-gray-500 text-sm">Total Tasks</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">
            {actions.length}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
          <p className="text-gray-500 text-sm">Pending Tasks</p>
          <h3 className="text-3xl font-bold text-yellow-500 mt-2">
            {pendingTasks.length}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
          <p className="text-gray-500 text-sm">Completed Tasks</p>
          <h3 className="text-3xl font-bold text-green-600 mt-2">
            {completedTasks.length}
          </h3>
        </div>

      </div>


      {/* Recent Meetings */}

      <div className="mb-10">

        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          Recent Meetings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filteredMeetings.slice(0,6).map(m=>(
            <MeetingCard key={m._id} meeting={m}/>
          ))}

        </div>

      </div>


      {/* Quick Actions */}

      <div className="mb-10">

        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          Quick Actions
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">

          <a
          href="/upload"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg text-sm font-medium transition"
          >
          Upload Meeting Notes
          </a>

          <a
          href="/actions"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg text-sm font-medium transition"
          >
          View Action Items
          </a>

        </div>

      </div>


      {/* Action Items Preview */}

      <div>

        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          Action Items Preview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {actions.slice(0,6).map((a) => (
            <ActionCard
              key={a._id}
              action={a}
              refresh={fetchData}
            />
          ))}

        </div>

      </div>

    </div>

    </DashboardLayout>

  )

}