import { redirect, json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { requireAuth } from "~/server/auth.server"
import { queryAccountByUid } from "~/graphql/public-apis"
import FirstprofileNotification from "~/components/firstprofile-notification"

export async function loader({ request }: LoaderArgs) {
  const { user, headers } = await requireAuth(request)

  if (!user) {
    return redirect("/auth", { headers })
  }
  const account = await queryAccountByUid(user.uid)
  let hasProfile = account?.profiles?.length > 0

  return json({ user, account, hasProfile }, { headers })
}

export default function Upload() {
  const data = useLoaderData<typeof loader>()
  // Check if it is the first profile of the user or not
  const isFirstProfile =
    typeof data?.hasProfile === "boolean" && !data?.hasProfile

  return (
    <div className="page">
      <h6>Upload</h6>

      {isFirstProfile && <FirstprofileNotification />}
    </div>
  )
}
