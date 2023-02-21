import { redirect, json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { useCatch } from "@remix-run/react"

import ErrorComponent from "~/components/error"
import { requireAuth } from "~/server/auth.server"
import { queryAccountByUid } from "~/graphql/public-apis"

export async function loader({ request }: LoaderArgs) {
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

    const loggedInProfile = account.profile

    return json({ user, account, loggedInProfile }, { headers })
  } catch (error) {
    throw new Response("Something not right")
  }
}

export default function Upload() {
  return (
    <div className="page">
      <h6>Upload</h6>
    </div>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  return <ErrorComponent error={caught.statusText} />
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <ErrorComponent error={error.message} />
}
