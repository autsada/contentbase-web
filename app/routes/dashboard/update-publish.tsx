/**
 * An API route to update a publish draft
 */

import { json, redirect } from "@remix-run/node"
import type { ActionArgs } from "@remix-run/node"

import { updatePublish } from "~/graphql/server"

export function loader() {
  return redirect("/")
}

export async function action({ request }: ActionArgs) {
  try {
    const form = await request.formData()
    const input = Object.fromEntries(form) as {
      idToken: string
      handle: string
      publishId: string
      isPublic: string // We have "true" | "false" as string here
    }

    const { idToken, handle, publishId, isPublic, ...rest } = input
    console.log("res -->", rest)

    // We need to provide `null` if the value doesn't exist as the graphql endpoint will except `null` but not empty value
    const data = await updatePublish(idToken, {
      publishId: Number(publishId),
      handle,
      isPublic: isPublic === "true", // Turn string to boolean
      ...rest,
    })

    return json(data)
  } catch (error) {
    console.log("error -->", error)
    return json({ status: "Error", publishId: null })
  }
}

export type UpdatePublishAction = typeof action
