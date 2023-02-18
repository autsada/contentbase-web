import { useEffect } from "react"
import { useNavigate, useRevalidator } from "@remix-run/react"
import { useAccount, useDisconnect } from "wagmi"
import { redirect, json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"

import { CLEAN_UP_CODE, CLEAN_UP_ID, LOGGED_IN_KEY } from "~/constants"

export function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get(CLEAN_UP_ID)

  // Verify if the request is comming from the logout route
  if (code !== CLEAN_UP_CODE) {
    return redirect("/")
  }

  return json({ code })
}

export default function CleanUp() {
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    if (typeof document === "undefined") return

    // Remove the `loggedIn` key from localStorage so all opened tabs will be reloaded to update session and log out from all
    const loggedIn = window.localStorage.getItem(LOGGED_IN_KEY)
    if (loggedIn) {
      window.localStorage.removeItem(LOGGED_IN_KEY)

      // If the user connected with their wallet, disconnect to the wallet
      if (isConnected) {
        disconnect()
      }
    }

    // Revalidate states
    revalidator.revalidate()

    // Navigate to homepage
    navigate("/")

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, isConnected, disconnect])

  return <div className="page h-screen"></div>
}
