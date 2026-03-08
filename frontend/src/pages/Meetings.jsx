import { useEffect, useState } from "react";
import API from "../api/api";
// import Navbar from "../components/Navbar";
import DashboardLayout from "../layout/DashboardLayout"

export default function Meetings() {

  const [meetings, setMeetings] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const fetchMeetings = async () => {

    try {

      const res = await API.get("/meetings");

      setMeetings(res.data);

    } catch (err) {

      console.log("Error fetching meetings", err);

    }

  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Filter Logic (Search + Type)
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

      {/* <Navbar /> */}

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
                {m.title}
              </h3>

              <p className="text-sm text-gray-500">
                Type: {m.type}
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

            </div>

          ))}

        </div>

      </div>

    </DashboardLayout>

  );

}