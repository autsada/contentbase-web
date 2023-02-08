import { useEffect, useState } from "react"
import { json, redirect } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Outlet, useCatch, useOutletContext } from "@remix-run/react"

import { BackdropWithInfo } from "~/components/backdrop-info"
import ErrorComponent from "~/components/error"
import { requireAuth } from "~/server/auth.server"
import { clientAuth } from "~/client/firebase.client"
import { useAppContext } from "~/root"
import type { Account, Profile } from "~/types"

type ProfileContext = {
  idToken: string
  account: Account
  profile: Profile
  balance: string | undefined
  hasProfile: boolean | undefined
}

export async function loader({ request }: LoaderArgs) {
  const { user, headers } = await requireAuth(request)

  if (!user) {
    return redirect("/auth", { headers })
  }

  return json({ user }, { headers })
}

export default function ProfileDashboard() {
  const context = useAppContext()

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
          account: context?.account,
          profile: context?.profile,
          balance: context?.balance,
          hasProfile: context?.hasProfile,
        }}
      />

      {/* For some reason if user still doesn't have an account, we need to have them log out and log in again */}
      {!context?.account && (
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
