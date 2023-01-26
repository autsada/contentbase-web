import { useEffect } from "react"
import { useNavigate } from "@remix-run/react"

import { Spinner } from "~/components/spinner"
import { LOGGED_IN_KEY } from "~/constants"

export default function CleanUp() {
  const navigate = useNavigate()

  useEffect(() => {
    if (typeof document === "undefined") return

    // Remove the `loggedIn` key from localStorage so all opened tabs will be reloaded to update session and log out from all
    const loggedIn = window.localStorage.getItem(LOGGED_IN_KEY)
    if (loggedIn) {
      window.localStorage.removeItem(LOGGED_IN_KEY)
    }

    // Navigate to homepage
    navigate("/")
  }, [navigate])

  // Show spinner on the screen
  return (
    <div className="page h-screen flex flex-col justify-center items-center">
      <Spinner />
    </div>
  )
}
