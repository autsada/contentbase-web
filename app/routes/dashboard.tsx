import { redirect, json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react"
import type { UserRecord } from "firebase-admin/auth"

import { checkAuthenticatedAndReady } from "~/server/auth.server"
import { getBalance } from "~/graphql/server"
import { listPublishesByCreator } from "~/graphql/public-apis"
import type { Profile, Account } from "~/types"
import type { NexusGenFieldTypes } from "~/graphql/public-apis/typegen"

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

    // Redirect user to create their first profile if they don't already have
    if (!loggedInProfile) {
      return redirect("/create", { headers })
    }

    const url = new URL(request.url)
    const isStartUpload = url.searchParams.get("upload")
    const address = account.address
    const balance = address ? await getBalance(address) : ""
    // Query publishes uploaded by the loggged in profile
    const publishes = await listPublishesByCreator(Number(loggedInProfile.id))

    return json(
      {
        startUpload: isStartUpload === "true",
        user,
        account,
        loggedInProfile,
        balance,
        publishes,
      },
      { headers }
    )
  } catch (error) {
    throw new Response("Something not right")
  }
}

export default function Content() {
  const data = useLoaderData<typeof loader>()

  return (
    <Outlet
      context={{
        startUpload: data?.startUpload,
        user: data?.user,
        account: data?.account,
        profile: data?.loggedInProfile,
        balance: data?.balance,
        publishes: data?.publishes,
      }}
    />
  )
}

export type DashboardContext = {
  startUpload: boolean
  user: UserRecord
  profile: Profile
  account: Account
  balance: string | undefined
  publishes: NexusGenFieldTypes["Publish"][]
}

export function useDashboardContext() {
  return useOutletContext<DashboardContext>()
}
