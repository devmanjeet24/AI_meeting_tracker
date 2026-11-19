import { useEffect, useState } from "react"
import API from "../api/api"

let cached = null

export default function useUser() {
  const [user, setUser] = useState(cached)

  useEffect(() => {
    if (cached) return
    API.get("/auth/me").then((r) => { cached = r.data; setUser(r.data) }).catch(() => {})
  }, [])

  const update = (u) => { cached = u; setUser(u) }
  return [user, update]
}
