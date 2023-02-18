import { redirect, json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"

import { BackdropWithInfo } from "~/components/backdrop-info"
import { queryAccountByUid } from "~/graphql/public-apis"
import { requireAuth } from "~/server/auth.server"
import FirstprofileNotification from "~/components/firstprofile-notification"

/**
 * Query account by uid
 */
export async function loader({ request }: LoaderArgs) {
  const { user, headers } = await requireAuth(request)

  if (!user) {
    return redirect("/auth", { headers })
  }
  const account = await queryAccountByUid(user.uid)
  let hasProfile = !!account?.profile

  return json({ user, account, hasProfile }, { headers })
}

export default function Settings() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <Outlet
        context={{
          user: data?.user,
          account: data?.account,
          hasProfile: data?.hasProfile,
        }}
      />

      {/* For some reason if user still doesn't have an account, we need to have them log out and log in again */}
      {!data?.account ? (
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
              <form action="/auth/logout" method="post">
                <button className="btn-orange text-sm rounded-3xl w-max h-8 px-5">
                  Log out
                </button>
              </form>
            </div>
          </div>
        </BackdropWithInfo>
      ) : typeof data?.hasProfile === "boolean" && !data?.hasProfile ? (
        // If User has an account, but doesn't have any profile yet.
        <FirstprofileNotification />
      ) : null}
    </>
  )
}
