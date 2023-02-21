import { redirect, json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"

import { queryAccountByUid } from "~/graphql/public-apis"
import { requireAuth } from "~/server/auth.server"

export async function loader({ request, params }: LoaderArgs) {
  try {
    const { user, headers } = await requireAuth(request)

    if (!user) {
      return redirect("/auth", { headers })
    }

    // Get user' account and the current logged in profile
    const account = user ? await queryAccountByUid(user.uid) : null
    // Reaauthenticate user if they still doesn't have an account
    if (!account) {
      return redirect("/auth/reauthenticate", { headers })
    }

    const loggedInProfile = account?.profile
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
