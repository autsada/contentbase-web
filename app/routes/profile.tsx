import { json, redirect } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react"

import { requireAuth } from "~/server/auth.server"
import { queryAccountByUid } from "~/graphql/public-apis"
import { getBalance } from "~/graphql/server"
import type { Account } from "~/types"
import { BackdropWithInfo } from "~/components/backdrop-info"

type AccountContext = {
  account: Account
  balance: string | undefined
  hasProfile: boolean | undefined
}

export async function loader({ request }: LoaderArgs) {
  const { user, headers } = await requireAuth(request)

  if (!user) {
    return redirect("/auth", { headers })
  }

  // Query user's account data
  const account = await queryAccountByUid(user.uid)
  let address = ""
  let balance = ""
  let hasProfile: boolean | undefined = undefined

  if (account) {
    address = account.address
    balance = address ? await getBalance(address) : ""
    hasProfile = account.profiles.length > 0
  }

  return json({ account, balance, hasProfile }, { headers })
}

export default function Profile() {
  const data = useLoaderData<typeof loader>()
  const account = data?.account
  const balance = data?.balance
  const hasProfile = data?.hasProfile

  return (
    <>
      <Outlet context={{ account, balance, hasProfile }} />

      {/* For some reason if user still doesn't have an account, we need to have them log out and log in again */}
      {!account && (
        <BackdropWithInfo>
          <h6 className="text-center text-base">
            Sorry, we couldn't find your account. Please log out and sign in
            again.
          </h6>
          <div className="mt-6">
            <form action="/logout" method="post">
              <button className="btn-orange text-sm rounded-3xl w-max h-8 px-5">
                Logout
              </button>
            </form>
          </div>
        </BackdropWithInfo>
      )}
    </>
  )
}

export function useAccountContext() {
  return useOutletContext<AccountContext>()
}
