import { redirect, json } from "@remix-run/node"
import type { ActionArgs } from "@remix-run/node"

import { validateHandle } from "~/graphql/server"

export function loader() {
  return redirect("/profile/create")
}

export async function action({ request }: ActionArgs) {
  try {
    const form = await request.formData()
    const { handle } = Object.fromEntries(form) as { handle: string }
    // Call validate handle in the `Server` service for both `TRADITIONAL` and `WALLET` accounts as the underlining funtion on the blockchain is `Read` that doesn't require private key.
    const isUnique = await validateHandle(handle)

    return json({ isUnique })
  } catch (error) {
    return json({ isUnique: null })
  }
}

export type validateActionType = typeof action
