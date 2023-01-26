import { useEffect } from "react"
import type { LoaderArgs } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import type { User } from "firebase/auth"

import { requireAuth } from "~/server/auth.server"
import { LOGGED_IN_KEY } from "~/constants"

export async function loader({ request }: LoaderArgs) {
  return requireAuth(request)
}

export default function Profile() {
  const data = useLoaderData<typeof loader>()
  const user = data?.user as User | null
  const uid = user?.uid

  // If user logged in for the first time, write `loggedIn` key to localStorage so all opened tabs will be reloaded to update session state.
  useEffect(() => {
    if (typeof document === "undefined") return

    const loggedIn = window.localStorage.getItem(LOGGED_IN_KEY)

    if (uid) {
      if (!loggedIn) {
        window.localStorage.setItem(LOGGED_IN_KEY, Math.random().toString())
      }
    }
  }, [uid])

  return (
    <>
      <Outlet />
    </>
  )
}
