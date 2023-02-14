import { useEffect, useState } from "react"
import { json, redirect } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import {
  Outlet,
  useCatch,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react"

import ErrorComponent from "~/components/error"
import { BackdropWithInfo } from "~/components/backdrop-info"
import { requireAuth } from "~/server/auth.server"
import { clientAuth } from "~/client/firebase.client"
import { useAppContext } from "~/root"
import { queryAccountByUid } from "~/graphql/public-apis"
import { getBalance } from "~/graphql/server"
import type { Account, Profile } from "~/types"

export async function loader({ request }: LoaderArgs) {
  const { user, headers } = await requireAuth(request)

  if (!user) {
    return redirect("/auth", { headers })
  }
  const account = await queryAccountByUid(user.uid)
  let address = ""
  let balance = ""
  let hasProfile: boolean | undefined = undefined

  if (account) {
    address = account.address
    balance = address ? await getBalance(address) : ""
    hasProfile = account.profiles.length > 0
  }

  return json({ user, account, balance, hasProfile }, { headers })
}

export default function ProfileDashboard() {
  const context = useAppContext()
  const loaderData = useLoaderData<typeof loader>()

  const [idToken, setIdToken] = useState("")

  /**
   * Listen to id token change, and set it to context for use to communicate with the `Server` service in server side code.
   */
  useEffect(() => {
    if (typeof document === "undefined") return

    const unsubscribe = clientAuth.onIdTokenChanged(async (user) => {
      let idToken: string = ""
      if (user) {
        idToken = await user.getIdToken()
      } else {
        idToken = ""
      }
      setIdToken(idToken)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <>
      <Outlet
        context={{
          idToken,
          account: loaderData?.account,
          loggedInProfile: context?.loggedInProfile,
          balance: loaderData?.balance,
          hasProfile: loaderData?.hasProfile,
          // For logged in profile, use context as it will be handled client side
        }}
      />

      {/* For some reason if user still doesn't have an account, we need to have them log out and log in again */}
      {!context?.account && (
        <BackdropWithInfo>
          <div className="px-2">
            <h6 className="text-center text-base">
              Sorry, it seems you don't have an account yet.{" "}
              <span className="block mt-2 text-blueBase">
                In order to proceed you will need an account, you can get one by
                simply log out and log back in again.
              </span>
            </h6>
            <div className="mt-6">
              <form action="/logout" method="post">
                <button className="btn-orange text-sm rounded-3xl w-max h-8 px-5">
                  Log out
                </button>
              </form>
            </div>
          </div>
        </BackdropWithInfo>
      )}
    </>
  )
}

export type ProfileContext = {
  idToken: string
  account: Account
  loggedInProfile: Profile
  balance: string | undefined
  hasProfile: boolean | undefined
}

export function useProfileContext() {
  return useOutletContext<ProfileContext>()
}

export function CatchBoundary() {
  const caught = useCatch()

  return <ErrorComponent error={caught.statusText} />
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <ErrorComponent error={error.message} />
}
