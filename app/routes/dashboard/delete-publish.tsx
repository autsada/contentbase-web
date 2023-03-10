/**
 * An API route to delete a publish in the database and delete a publish NFT
 * @dev Use this route for both `TRADITIONAL` and `WALLET` account
 */

import { json, redirect } from "@remix-run/node"
import type { ActionArgs } from "@remix-run/node"

import { checkAuthenticatedAndReady } from "~/server/auth.server"
import { deletePublish } from "~/graphql/server"
import { getPublish } from "~/graphql/public-apis"

export function loader() {
  return redirect("/")
}

export async function action({ request }: ActionArgs) {
  try {
    const { account, loggedInProfile } = await checkAuthenticatedAndReady(
      request
    )

    if (!account || !loggedInProfile) {
      return json({
        status: "Error",
        message: "Authentication check failed",
      })
    }
    const form = await request.formData()
    const input = Object.fromEntries(form) as {
      idToken: string
      publishId: string
    }

    const { idToken, publishId } = input

    // Query publish from the database
    const publish = await getPublish(Number(publishId))

    if (!publish) {
      return json({ status: "Error" })
    }

    // Check authorization
    if (loggedInProfile?.id !== publish.creator?.id) {
      return json({ status: "Error" })
    }

    const accountType = account.type

    const data = await deletePublish(`${idToken}`, {
      publishId: Number(publishId),
      creatorId: loggedInProfile.id,
      // For `TRADITIONAL` account, if the publish has an NFT (`tokenId` is set), we need to also pass the `tokenId` and the creator profile token id so we can delete the publish NFT.
      publishTokenId:
        accountType === "TRADITIONAL" && publish.tokenId
          ? publish.tokenId
          : null,
      creatorTokenId:
        accountType === "TRADITIONAL" && publish.tokenId
          ? publish.creator?.tokenId
          : null,
    })

    return json(data)
  } catch (error) {
    return json({ status: "Error" })
  }
}

export type DeletePublishAction = typeof action
