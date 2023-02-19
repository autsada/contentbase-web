/**
 * An API route to get estimated gas used to update a profile image.
 */
import { json, redirect } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"

import { estimateGaseUpdateProfileImage } from "~/graphql/server"

export function loader() {
  return redirect("/")
}

export async function action({ request }: LoaderArgs) {
  try {
    // Get data from the form
    const form = await request.formData()
    const { idToken, tokenId } = Object.fromEntries(form) as {
      idToken: string // Firebase auth id token
      tokenId: string // Profile NFT token id
    }

    // Call the API
    const data = await estimateGaseUpdateProfileImage({
      idToken,
      tokenId: Number(tokenId),
    })

    return json({ gas: data?.gas })
  } catch (error) {
    return json({ gas: null })
  }
}

export type EstimateGasUpdateProfileImageAction = typeof action
