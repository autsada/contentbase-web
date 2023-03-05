import { json } from "@remix-run/node"
import { useCatch, useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/node"

import ErrorComponent from "~/components/error"
import { getPublish } from "~/graphql/public-apis"
import { checkAuthenticatedAndReady } from "~/server/auth.server"

export async function loader({ request, params }: LoaderArgs) {
  try {
    const publishId = params.publishId
    if (!publishId) {
      throw new Response("Cannot load the content.")
    }

    const { loggedInProfile, headers } = await checkAuthenticatedAndReady(
      request
    )

    // Fetch the publish from database
    const publish = await getPublish(
      Number(publishId),
      loggedInProfile ? loggedInProfile.id : undefined
    )

    return json({ publish }, { headers })
  } catch (error) {
    throw new Response("Error occurred while trying to load the content.")
  }
}

export default function WatchPublish() {
  const data = useLoaderData<typeof loader>()

  console.log("data -->", data)
  return <div className="page">WatchPublish</div>
}

export function CatchBoundary() {
  const caught = useCatch()

  return (
    <ErrorComponent error={caught.statusText}>
      <div className="text-center py-10">
        <h3 className="text-error">Error Occurred</h3>
        <div className="px-5">
          <p className="my-5 font-light text-textLight">{caught.data}</p>
        </div>
      </div>
    </ErrorComponent>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return (
    <ErrorComponent error={error.message}>
      <div className="text-center py-10">
        <h3 className="text-error">Error Occurred</h3>
        <div className="px-5">
          <p className="my-5 font-light text-textLight">
            Error occurred while attempting to load the content.
          </p>
        </div>
      </div>
    </ErrorComponent>
  )
}
