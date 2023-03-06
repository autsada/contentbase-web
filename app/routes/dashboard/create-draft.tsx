/**
 * An API route to save a publish draft
 */

import { json, redirect } from "@remix-run/node"
import type { ActionArgs } from "@remix-run/node"

import { createDraftPublish } from "~/graphql/server"

export function loader() {
  return redirect("/")
}

export async function action({ request }: ActionArgs) {
  try {
    const form = await request.formData()
    const input = Object.fromEntries(form) as {
      idToken: string
      creatorId: string
      creatorTokenId: string
      title?: string | null
      filename?: string | null
    }

    const { idToken, creatorId, creatorTokenId, title, filename } = input

    const data = await createDraftPublish(idToken, {
      creatorId: Number(creatorId),
      creatorTokenId,
      title,
      filename,
    })

    return json(data)
  } catch (error) {
    return json({ status: "Error", publishId: null })
  }
}

export type CreateDraftAction = typeof action
