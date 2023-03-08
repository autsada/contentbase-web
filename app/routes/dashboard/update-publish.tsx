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
    }

    const { idToken, handle, publishId, ...rest } = input

    // We need to provide `null` if the value doesn't exist as the graphql endpoint will except `null` but not empty value
    const data = await updatePublish(idToken, {
      publishId: Number(publishId),
      handle,
      ...rest,
    })

    return json(data)
  } catch (error) {
    return json({ status: "Error", publishId: null })
  }
}

export type UpdateDraftAction = typeof action
