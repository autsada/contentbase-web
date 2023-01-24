import { json, redirect } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import type { UserRecord } from "firebase-admin/auth"

import { requireAuth } from "~/server/auth.server"
import { useLoaderData } from "@remix-run/react"

export async function loader({ request }: LoaderArgs) {
  const user = await requireAuth(request)
  if (!user) {
    return redirect("/connect")
  }

  return json({ user })
}

export default function Profile() {
  const data = useLoaderData<typeof loader>()
  const user = data?.user as UserRecord

  console.log("user -->", user)
  alert(`user: ${user.uid}`)
  return <div>Profile</div>
}
