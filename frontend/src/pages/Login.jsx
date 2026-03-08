import { useForm } from "react-hook-form"
import { useNavigate, Link } from "react-router-dom"
import { useState } from "react"
import API from "../api/api"

export default function Login(){

  const {register,handleSubmit} = useForm()
  const navigate = useNavigate()

  const [loading,setLoading] = useState(false)

  const onSubmit = async(data)=>{

    try{

      setLoading(true)

      const res = await API.post("/auth/login",data)

      localStorage.setItem("token",res.data.token)

      navigate("/dashboard")

    }catch(err){

      alert("Invalid login")

    }finally{

      setLoading(false)

    }

  }

  return(

    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">

      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8 border">

        {/* Title */}

        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">
          Login to your account
        </h2>


        {/* Form */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>

            <label className="text-sm text-gray-600">
              Email
            </label>

            <input
            {...register("email")}
            placeholder="Enter your email"
            className="border border-slate-300 rounded-md p-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

          </div>

          <div>

            <label className="text-sm text-gray-600">
              Password
            </label>

            <input
            {...register("password")}
            type="password"
            placeholder="Enter password"
            className="border border-slate-300 rounded-md p-2 w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

          </div>


          {/* Button */}

          <button
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium transition flex items-center justify-center gap-2"
          >

            {loading ? (
              <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Logging in...
              </>
            ) : (
              "Login"
            )}

          </button>

        </form>


        {/* Register Link */}

        <p className="mt-6 text-sm text-center text-gray-600">

          Don't have an account?

          <Link
          to="/register"
          className="text-indigo-600 ml-1 font-medium hover:underline"
          >
          Register
          </Link>

        </p>

      </div>

    </div>

  )

}