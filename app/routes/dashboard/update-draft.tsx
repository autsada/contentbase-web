/**
 * An API route to update a publish draft
 */

import { json, redirect } from "@remix-run/node"
import type { ActionArgs } from "@remix-run/node"

import { updateDraftPublish } from "~/graphql/server"
import type { PublishCategory } from "~/types"

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
      title: string
      description: string
      primaryCategory: PublishCategory
      secondaryCategory: PublishCategory
      tertiaryCategory: PublishCategory
      isPublic: "true" | "false"
    }

    const {
      idToken,
      handle,
      publishId,
      title,
      description,
      primaryCategory,
      secondaryCategory,
      tertiaryCategory,
      isPublic,
    } = input

    // We need to provide `null` if the value doesn't exist as the graphql endpoint will except `null` but not empty value
    const data = await updateDraftPublish(idToken, {
      publishId: Number(publishId),
      handle,
      title: title || null,
      description: description || null,
      primaryCategory: primaryCategory || null,
      secondaryCategory: secondaryCategory || null,
      tertiaryCategory: tertiaryCategory || null,
      isPublic: isPublic === "true",
    })

    return json(data)
  } catch (error) {
    return json({ status: "Error", publishId: null })
  }
}

export type UpdateDraftAction = typeof action
