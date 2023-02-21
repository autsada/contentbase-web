import {
  Outlet,
  useCatch,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react"
import { json, redirect } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import type { UserRecord } from "firebase-admin/auth"

import ErrorComponent from "~/components/error"
import { checkAuthenticatedAndReady } from "~/server/auth.server"
import { getBalance } from "~/graphql/server"
import type { Profile, Account } from "~/types"

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

    const address = account.address
    const balance = address ? await getBalance(address) : ""

    return json({ user, account, loggedInProfile, balance }, { headers })
  } catch (error) {
    throw new Response("Something not right")
  }
}

export default function Wallet() {
  const data = useLoaderData<typeof loader>()

  return (
    <Outlet
      context={{
        user: data?.user,
        account: data?.account,
        profile: data?.loggedInProfile,
        balance: data?.balance,
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

export type WalletContext = {
  user: UserRecord
  profile: Profile
  account: Account
  balance: string | undefined
}

export function useWalletContext() {
  return useOutletContext<WalletContext>()
}
