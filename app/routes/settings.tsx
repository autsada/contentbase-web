import { redirect, json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Outlet, useCatch, useLoaderData } from "@remix-run/react"

import ErrorComponent from "~/components/error"
import { queryAccountByUid } from "~/graphql/public-apis"
import { requireAuth } from "~/server/auth.server"

export async function loader({ request }: LoaderArgs) {
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
}

export default function Settings() {
  const data = useLoaderData<typeof loader>()

  return (
    <Outlet
      context={{
        user: data?.user,
        account: data?.account,
        profile: data?.loggedInProfile,
      }}
    />
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
