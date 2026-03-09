import { useEffect, useState } from "react";
import API from "../api/api";
import DashboardLayout from "../Layout/DashboardLayout";
import { FaTrash } from "react-icons/fa";
import { FaStickyNote } from "react-icons/fa";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Meetings() {

  const [meetings, setMeetings] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [selectedNotes, setSelectedNotes] = useState("");
  const [openDialog, setOpenDialog] = useState(false);


  const fetchMeetings = async () => {

    try {

      const res = await API.get("/meetings");
      setMeetings(res.data);

    } catch (err) {

      console.log("Error fetching meetings", err);

    }

  };


  const deleteMeeting = async (id) => {

    if (!window.confirm("Are you sure you want to delete this meeting?"))
      return;

    try {

      await API.delete(`/meetings/${id}`);

      setMeetings((prev) => prev.filter((m) => m._id !== id));

    } catch (err) {

      console.log("Error deleting meeting", err);

    }

  };


  const openNotes = (notes) => {

    setSelectedNotes(notes || "");
    setOpenDialog(true);

  };


  useEffect(() => {

    fetchMeetings();

  }, []);


  const filtered = meetings.filter((m) => {

    const matchSearch =
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.summary?.toLowerCase().includes(search.toLowerCase());

    const matchType =
      typeFilter === "All" || m.type === typeFilter;

    return matchSearch && matchType;

  });


  return (

    <DashboardLayout>

      <div className="p-8">

        <h1 className="text-2xl font-bold mb-6">
          Meeting History
        </h1>


        {/* Search + Filter */}

        <div className="flex gap-4 mb-6">

          <input
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 w-80 rounded"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border p-2 rounded"
          >

            <option value="All">All Meetings</option>
            <option value="Standup">Standup</option>
            <option value="Planning">Planning</option>
            <option value="Review">Review</option>

          </select>

        </div>


        {/* Meeting Cards */}

        <div className="grid grid-cols-2 gap-6">

          {filtered.map((m) => (

            <div
              key={m._id}
              className="border p-4 rounded shadow bg-white"
            >

              <h3 className="font-bold text-lg">
                {m.title || "Untitled Meeting"}
              </h3>

              <p className="text-sm text-gray-500">
                Type: {m.type || "Not specified"}
              </p>

              <p className="text-sm">
                Participants: {m.participants?.join(", ") || "None"}
              </p>

              <div className="mt-3">

                <p className="font-semibold">
                  AI Summary
                </p>

                <p className="text-gray-700 text-sm">
                  {m.summary || "No summary available"}
                </p>

              </div>


              {/* ACTION BUTTONS */}

              <div className="flex gap-3 mt-4">

                {/* NOTES BUTTON */}

                <button
                  onClick={() => openNotes(m.notes)}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
                >
                  <FaStickyNote />
                  Notes
                </button>


                {/* DELETE BUTTON */}

                <button
                  onClick={() => deleteMeeting(m._id)}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
                >
                  <FaTrash />
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* NOTES POPUP */}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>

        <DialogContent className="max-w-2xl">

          <DialogHeader>

            <DialogTitle>
              Meeting Notes
            </DialogTitle>

          </DialogHeader>

          <div className="mt-4 max-h-[400px] overflow-y-auto text-sm text-gray-700 whitespace-pre-line">

            {selectedNotes
              ? selectedNotes
              : "No notes available for this meeting."}

          </div>

        </DialogContent>

      </Dialog>

    </DashboardLayout>

  );

}