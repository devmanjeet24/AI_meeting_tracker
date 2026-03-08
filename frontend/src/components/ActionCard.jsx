import { useState } from "react";
import API from "../api/api";

export default function ActionCard({ action, refresh }) {

  const [owner, setOwner] = useState(action.owner);
  const [deadline, setDeadline] = useState(action.deadline);

  const statusColors = {
    "Pending": "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "Done": "bg-green-100 text-green-800"
  };

  const priorityColors = {
    "High": "bg-red-100 text-red-800",
    "Medium": "bg-orange-100 text-orange-800",
    "Low": "bg-green-100 text-green-800"
  };

  const updateStatus = async (status) => {

    try {

      await API.patch(`/actions/${action._id}`, {
        status
      });

      refresh();

    } catch (err) {

      alert("Update failed");

    }

  };

  const saveChanges = async () => {

    try {

      await API.patch(`/actions/${action._id}`, {
        owner,
        deadline
      });

      refresh();

    } catch (err) {

      alert("Update failed");

    }

  };

  return (

    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col">

      {/* Task Title */}

      <h3 className="font-semibold text-lg text-slate-800 mb-3">
        {action.task}
      </h3>


      {/* Badges */}

      <div className="flex flex-wrap gap-2 mb-4">

        <span
        className={`px-2 py-1 text-xs font-medium rounded-md ${priorityColors[action.priority]}`}
        >
          Priority: {action.priority}
        </span>

        <span
        className={`px-2 py-1 text-xs font-medium rounded-md ${statusColors[action.status]}`}
        >
          {action.status}
        </span>

      </div>


      {/* Inputs */}

      <div className="space-y-3">

        <div>

          <label className="text-xs text-gray-500">
            Owner
          </label>

          <input
          value={owner}
          onChange={(e)=>setOwner(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

        </div>

        <div>

          <label className="text-xs text-gray-500">
            Deadline
          </label>

          <input
          value={deadline}
          onChange={(e)=>setDeadline(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

        </div>

        <button
        onClick={saveChanges}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded-md transition"
        >
          Save Changes
        </button>

      </div>


      {/* Status Buttons */}

      <div className="flex gap-2 mt-4 flex-wrap">

        <button
        onClick={() => updateStatus("In Progress")}
        className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-2 rounded-md transition"
        >
          Start
        </button>

        <button
        onClick={() => updateStatus("Done")}
        className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-md transition"
        >
          Done
        </button>

      </div>

    </div>

  );

} 