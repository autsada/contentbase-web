/**
 * An API route to follow other profiles.
 */
import { json, redirect } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"

import { follow } from "~/graphql/server"

export function loader() {
  return redirect("/")
}

export async function action({ request }: LoaderArgs) {
  try {
    // Get data from the form
    const form = await request.formData()
    const { followerId, followeeId, idToken } = Object.fromEntries(form) as {
      idToken: string // Firebase auth id token
      followerId: string // A follower profile token id
      followeeId: string // A followee profile token id
    }

    // Call the API
    const data = await follow({
      followerId: Number(followerId),
      followeeId: Number(followeeId),
      idToken,
    })

    return json({ status: data.status })
  } catch (error) {
    return json({ status: "Error" })
  }
}

export type FollowAction = typeof action
