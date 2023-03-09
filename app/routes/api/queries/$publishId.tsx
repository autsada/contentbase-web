import { json, redirect } from "@remix-run/node"
import type { ActionArgs } from "@remix-run/node"
import { getPreviewPublish } from "~/graphql/public-apis"

export function loader() {
  return redirect("/")
}

// An action to query a publish
export async function action({ params }: ActionArgs) {
  try {
    const publishId = params.publishId

    if (!publishId) return json({ publish: null })

    const publish = await getPreviewPublish(Number(publishId))
    return json({ publish })
  } catch (error) {
    return json({ publish: null })
  }
}

export type GetPublishAction = typeof action
