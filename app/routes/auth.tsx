import { useEffect } from "react"
import { redirect, json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Outlet } from "@remix-run/react"

import { getUser, getUserSession } from "~/server/auth.server"
import { commitSession } from "~/server/session.server"
import { useAppContext } from "~/root"
import { INITIAL_VISIT_ID } from "~/constants"

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getUserSession(request)
  const user = await getUser(request)
  const headers = {
    "Set-Cookie": await commitSession(session),
  }

  if (user) {
    return redirect("/", { headers })
  }

  return json(null, { headers })
}

export default function Auth() {
  const { welcomeModalVisible, setWelcomeModalVisible } = useAppContext()

  useEffect(() => {
    if (welcomeModalVisible) {
      setWelcomeModalVisible(false)
      window.localStorage.setItem(INITIAL_VISIT_ID, Date.now().toString())
    }
  }, [welcomeModalVisible, setWelcomeModalVisible])

  return (
    <>
      <Outlet />
    </>
  )
}
