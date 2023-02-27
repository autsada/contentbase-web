import { json, redirect } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import {
  Outlet,
  useCatch,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react"

import ErrorComponent from "~/components/error"
import { checkAuthenticatedAndReady } from "~/server/auth.server"
import type { UserRecord } from "firebase-admin/auth"
import type { Profile, Account } from "~/types"

export async function loader({ request }: LoaderArgs) {
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

    return json({ user, account, loggedInProfile }, { headers })
  } catch (error) {
    throw new Response("Something not right")
  }
}

export default function Upload() {
  const data = useLoaderData<typeof loader>()

  return <Outlet context={data} />
}

export function CatchBoundary() {
  const caught = useCatch()

  return <ErrorComponent error={caught.statusText} />
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <ErrorComponent error={error.message} />
}

export type UploadContext = {
  user: UserRecord
  profile: Profile
  account: Account
  balance: string | undefined
}

export function useUploadContext() {
  return useOutletContext<UploadContext>()
}
