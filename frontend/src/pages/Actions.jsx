import { useEffect, useState } from "react"
import API from "../api/api"
import ActionCard from "../components/ActionCard"
import DashboardLayout from "../layout/DashboardLayout"

export default function Actions(){

  const [actions,setActions] = useState([])

  const fetchActions = async()=>{

    try{

      const res = await API.get("/actions")

      setActions(res.data)

    }catch(err){

      console.log(err)

    }

  }

  useEffect(()=>{
    fetchActions()
  },[])

  return(

    <DashboardLayout>


      <div className="p-8 grid grid-cols-3 gap-6">

      {actions.map(a=>(
        <ActionCard
        key={a._id}
        action={a}
        refresh={fetchActions}
        />
      ))}

      </div>

    </DashboardLayout>

  )

}