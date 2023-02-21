import { redirect, json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"

import { checkAuthenticatedAndReady } from "~/server/auth.server"

export async function loader({ request, params }: LoaderArgs) {
  try {
    const { user, account, loggedInProfile, headers } =
      await checkAuthenticatedAndReady(request)

    // Push user to auth page if they are not logged in
    if (!user) {
      return redirect("/auth", { headers })
    }

    // Reaauthenticate user if they still doesn't have an account
    if (!account) {
      return redirect("/auth/reauthenticate", { headers })
    }

    if (!loggedInProfile) {
      return redirect("/create", { headers })
    }

    return json({
      loggedInProfile,
      accountType: account?.type,
    })
  } catch (error) {
    throw new Response("Something not right")
  }
}

export default function Following() {
  return <div className="page">Following</div>
}
