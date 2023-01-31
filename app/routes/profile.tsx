import { json, redirect } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react"
import type { UserRecord } from "firebase-admin/auth"

import { requireAuth } from "~/server/auth.server"
import { queryAccountByUid } from "~/graphql/public-apis"
import { getBalance } from "~/graphql/server"
import type { Account } from "~/types"

type AccountContext = {
  account: Account
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
  const account = data?.account
  const balance = data?.balance

  return (
    <>
      <Outlet context={{ user, account, balance }} />
    </>
  )
}

export function useAccountContext() {
  return useOutletContext<AccountContext>()
}
