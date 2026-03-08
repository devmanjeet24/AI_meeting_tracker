import { useState } from "react"
// import Navbar from "../components/Navbar"
import API from "../api/api"
import DashboardLayout from "../layout/DashboardLayout"
import Loader from "@/components/Loader"

export default function UploadNotes(){

  const [title,setTitle] = useState("")
  const [type,setType] = useState("Standup")
  const [participants,setParticipants] = useState("")
  const [file,setFile] = useState(null)
  const [loading,setLoading] = useState(false)

  const submitMeeting = async()=>{

    if(!title){
      alert("Enter meeting title")
      return
    }

    try{

      setLoading(true)

      let notes = ""

      // upload file
      if(file){

        const formData = new FormData()
        formData.append("file",file)

        const uploadRes = await API.post("/upload/notes",formData)

        notes = uploadRes.data.notes

      }

      // create meeting
      await API.post("/meetings/create",{

        title,
        notes,
        participants: participants.split(","),
        type

      })

      // AI process
      await API.post("/meetings/process",{
        notes
      })

      alert("Meeting created successfully")

    }catch(err){

      console.log(err)
      alert("Error creating meeting")

    }finally{
      setLoading(false)
    }

  }

  return(

    <DashboardLayout>

      {/* <Navbar/> */}

      <div className="p-10 max-w-lg">

        <h2 className="text-xl font-bold mb-4">
          Create Meeting
        </h2>

        {/* Title */}

        <input
        placeholder="Meeting title"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
        className="border p-2 w-full mb-4"
        />

        {/* Meeting Type */}

        <select
        value={type}
        onChange={(e)=>setType(e.target.value)}
        className="border p-2 w-full mb-4">

          <option>Standup</option>
          <option>Planning</option>
          <option>Review</option>

        </select>

        {/* Participants */}

        <input
        placeholder="Participants (comma separated)"
        value={participants}
        onChange={(e)=>setParticipants(e.target.value)}
        className="border p-2 w-full mb-4"
        />

        {/* File Upload */}

        <input
        type="file"
        onChange={(e)=>setFile(e.target.files[0])}
        className="mb-4"
        />

        <button
        onClick={submitMeeting}
        className="bg-blue-500 text-white px-4 py-2 rounded">

        {loading ? <Loader/> : "Create Meeting"}

        </button>

      </div>

    </DashboardLayout>

  )

}