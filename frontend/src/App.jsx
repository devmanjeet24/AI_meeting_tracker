import { BrowserRouter,Routes,Route } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import UploadNotes from "./pages/UploadNotes"
import Actions from "./pages/Actions"
import ProtectedRoute from "./routes/ProtectedRoute"
import Meetings from "./pages/Meetings"

export default function App(){

  return(

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login/>}/>

        <Route path="/register" element={<Register/>}/>

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

      </Routes>

    </BrowserRouter>

  )

}