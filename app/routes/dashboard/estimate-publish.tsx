/**
 * An API route to estimate gas for creating a publish
 * @dev Use this route for `TRADITIONAL` account only
 */

import { json, redirect } from "@remix-run/node"
import type { ActionArgs } from "@remix-run/node"

import { estimateGasCreatePublishNFT } from "~/graphql/server"
import { checkAuthenticatedAndReady } from "~/server/auth.server"

export function loader() {
  return redirect("/")
}

export async function action({ request }: ActionArgs) {
  try {
    const { loggedInProfile } = await checkAuthenticatedAndReady(request)

    if (!loggedInProfile) {
      return json({
        status: "Error",
        message: "Authentication check failed",
        gas: "",
      })
    }
    const form = await request.formData()
    const input = Object.fromEntries(form) as {
      idToken: string
      metadataURI: string
    }

    const { metadataURI, idToken } = input

    const data = await estimateGasCreatePublishNFT(`${idToken}`, {
      creatorId: loggedInProfile.tokenId,
      metadataURI,
    })

    return json(data)
  } catch (error) {
    console.log("error -->", error)
    return json({ status: "Error", gas: "" })
  }
}

export type EstimateGasCreatePublishAction = typeof action
