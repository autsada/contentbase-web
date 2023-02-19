import { json } from "@remix-run/node"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { redirectBack } from "remix-utils"
import { cacheLoggedInProfile } from "~/graphql/public-apis"

export function loader({ request }: LoaderArgs) {
  return redirectBack(request, { fallback: "/" })
}

export async function action({ request }: ActionArgs) {
  try {
    const form = await request.formData()
    const { address, tokenId } = Object.fromEntries(form) as {
      address: string
      tokenId: string
    }

    if (!address || !tokenId) return json(null)

    const data = await cacheLoggedInProfile(address.toLowerCase(), tokenId)

    return json({ status: data.status })
  } catch (error) {
    return json({ status: "Error" })
  }
}

export type SwitchProfileActionType = typeof action
