import { useEffect } from "react"
import { json, redirect } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react"
import type { UserRecord } from "firebase-admin/auth"

import { requireAuth } from "~/server/auth.server"
import { LOGGED_IN_KEY } from "~/constants"
import { queryAccountByUid } from "~/graphql/public-apis"
import { getBalance } from "~/graphql/server"

type ProfileContext = {
  user: UserRecord
  account: {
    address: string
    createdAt: any
    id: number
    type?: "TRADITIONAL" | "WALLET" | null | undefined
    uid?: string | null | undefined
    updatedAt?: any
  }
  balance: string | undefined
}

export async function loader({ request }: LoaderArgs) {
  const { user, headers } = await requireAuth(request)

  if (!user) {
    return redirect("/auth", { headers })
  }

  // Query user's account data
  const account = await queryAccountByUid(user.uid)
  const address = account?.address
  const balance = address ? await getBalance(address) : undefined

  return json({ user, account, balance }, { headers })
}

export default function Profile() {
  const data = useLoaderData<typeof loader>()
  const user = data?.user as UserRecord
  const uid = user?.uid
  const account = data?.account
  const balance = data?.balance

  // When user logged in, write `loggedIn` key to localStorage so all opened tabs will be reloaded to update session state.
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
      <Outlet context={{ user, account, balance }} />
    </>
  )
}

export function useProfileContext() {
  return useOutletContext<ProfileContext>()
}
