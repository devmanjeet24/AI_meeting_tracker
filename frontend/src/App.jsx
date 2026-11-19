import { BrowserRouter,Routes,Route,Navigate } from "react-router-dom"

import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import UploadNotes from "./pages/UploadNotes"
import Actions from "./pages/Actions"
import ProtectedRoute from "./routes/ProtectedRoute"
import Meetings from "./pages/Meetings"
import MeetingDetail from "./pages/MeetingDetail"
import Profile from "./pages/Profile"

export default function App(){

  return(

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Auth/>}/>

        <Route path="/register" element={<Auth/>}/>

        <Route
        path="/dashboard"
        element={
        <ProtectedRoute>
        <Dashboard/>
        </ProtectedRoute>
        }
        />

        <Route
        path="/upload"
        element={
        <ProtectedRoute>
        <UploadNotes/>
        </ProtectedRoute>
        }
        />

        <Route
        path="/actions"
        element={
        <ProtectedRoute>
        <Actions/>
        </ProtectedRoute>
        }
        />

        <Route
 path="/meetings"
 element={
 <ProtectedRoute>
 <Meetings/>
 </ProtectedRoute>
 }
/>

        <Route path="/meetings/:id" element={<ProtectedRoute><MeetingDetail/></ProtectedRoute>} />

        <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace/>} />

      </Routes>

    </BrowserRouter>

  )

}