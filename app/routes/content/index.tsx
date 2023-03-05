import { useCallback, useState, useEffect } from "react"
import { json, redirect } from "@remix-run/node"
import { useCatch, useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/node"

import { UploadModal } from "~/components/upload/upload-modal"
import ErrorComponent from "~/components/error"
import { checkAuthenticatedAndReady } from "~/server/auth.server"
import { getBalance } from "~/graphql/server"
import type { UploadType } from "~/components/upload/select-type"
import { listPublishesForCreator } from "~/graphql/public-apis"

export async function loader({ request }: LoaderArgs) {
  try {
    const { user, account, loggedInProfile, headers } =
      await checkAuthenticatedAndReady(request)

    // Push user to auth page if they are not logged in
    if (!user) {
      return redirect("/auth", { headers })
    }

    // Reaauthenticate user if they still doesn't have an account
    if (!account) {
      return redirect("/auth/reauthenticate", { headers })
    }

    // Redirect user to create their first profile if they don't already have
    if (!loggedInProfile) {
      return redirect("/create", { headers })
    }

    const address = account.address
    const balance = address ? await getBalance(address) : ""

    const url = new URL(request.url)
    const isStartUpload = url.searchParams.get("upload")

    // TODO: Query publishes uploaded by the loggged in profile
    const publishes = await listPublishesForCreator(Number(loggedInProfile.id))

    return json(
      {
        startUpload: isStartUpload === "true",
        user,
        account,
        loggedInProfile,
        balance,
        publishes,
      },
      { headers }
    )
  } catch (error) {
    throw new Response("Something not right")
  }
}

export default function ContentDashboard() {
  const data = useLoaderData<typeof loader>()

  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>()
  const [uploadType, setUploadType] = useState<UploadType>("SelectType")

  useEffect(() => {
    if (data.startUpload) {
      setUploadModalVisible(true)
    }
  }, [data])

  // const openUploadModal = useCallback(() => {
  //   setUploadModalVisible(true)
  // }, [])

  const closeUploadModal = useCallback((cb?: () => void) => {
    if (cb) {
      cb()
    }
    setUploadModalVisible(false)
  }, [])

  return (
    <div
      className={`page ${
        uploadModalVisible ? "overflow-y-hidden" : "overflow-y-auto"
      }`}
    >
      {uploadModalVisible && (
        <UploadModal
          closeModal={closeUploadModal}
          uploadType={uploadType}
          setUploadType={setUploadType}
        />
      )}
    </div>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  return <ErrorComponent error={caught.statusText} />
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <ErrorComponent error={error.message} />
}
