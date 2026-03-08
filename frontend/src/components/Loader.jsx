export default function Loader() {

  return (

    <div className="flex flex-col items-center justify-center min-h-screen gap-4">

      <div className="relative w-12 h-12">

        <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>

        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>

      </div>

      <p className="text-sm text-gray-500">
        Loading dashboard...
      </p>

    </div>

  )

}