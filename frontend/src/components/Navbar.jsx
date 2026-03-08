// import { Link, useNavigate } from "react-router-dom";

// export default function Navbar(){

//   const navigate = useNavigate()

//   const logout = () => {
//     localStorage.removeItem("token")
//     navigate("/")
//   }

//   return(
//     <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between">

//       <h1 className="font-bold text-xl">
//         AI Meeting Tracker
//       </h1>

//       <div className="flex gap-6">

//         <Link to="/dashboard">Dashboard</Link>
//         <Link to="/upload">Upload</Link>
//         <Link to="/actions">Actions</Link>
//         <Link to="/meetings">Meetings</Link>

//         <button
//         onClick={logout}
//         className="bg-red-500 px-3 py-1 rounded">
//         Logout
//         </button>

//       </div>

//     </nav>
//   )
// }