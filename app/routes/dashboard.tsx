import { useState, useCallback, useEffect } from "react"
import { redirect, json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react"
import type { UserRecord } from "firebase-admin/auth"

import { UploadModal } from "~/components/upload/upload-modal"
import { checkAuthenticatedAndReady } from "~/server/auth.server"
import { getBalance } from "~/graphql/server"
import { listPublishesByCreator } from "~/graphql/public-apis"
import type { Profile, Account, Publish } from "~/types"
import type { UploadType } from "~/components/upload/select-type"

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

    const url = new URL(request.url)
    const isStartUpload = url.searchParams.get("upload")
    const address = account.address
    const balance = address ? await getBalance(address) : ""
    // Query publishes uploaded by the loggged in profile
    const publishes = await listPublishesByCreator(Number(loggedInProfile.id))

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

export default function Content() {
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>()
  const [uploadType, setUploadType] = useState<UploadType>("SelectType")
  const [selectedPublish, setSelectedPublish] = useState<Publish>()

  const data = useLoaderData<typeof loader>()

  // Open upload modal if start upload is true
  useEffect(() => {
    if (data?.startUpload) {
      setUploadModalVisible(true)
    }
  }, [data?.startUpload])

  const closeUploadModal = useCallback((cb?: () => void) => {
    if (cb) {
      cb()
    }
    setUploadModalVisible(false)
    setSelectedPublish(undefined)
    setUploadType("SelectType")
  }, [])

  const selectPublish = useCallback(
    (publishId: number) => {
      if (data?.publishes?.length > 0) {
        const p = data.publishes.find((pub) => pub.id === publishId) as
          | Publish
          | undefined
        if (p) {
          setSelectedPublish(p)
          setUploadType(p?.kind || "Video")
          setUploadModalVisible(true)
        }
      }
    },
    [data?.publishes]
  )

  return (
    <>
      <Outlet
        context={{
          startUpload: data?.startUpload,
          user: data?.user,
          account: data?.account,
          profile: data?.loggedInProfile,
          balance: data?.balance,
          publishes: data?.publishes,
          selectPublish,
        }}
      />

      {uploadModalVisible && (
        <UploadModal
          closeModal={closeUploadModal}
          uploadType={uploadType}
          setUploadType={setUploadType}
          selectedPublish={selectedPublish}
        />
      )}
    </>
  )
}

export type DashboardContext = {
  startUpload: boolean
  user: UserRecord
  profile: Profile
  account: Account
  balance: string | undefined
  publishes: Publish[]
  selectPublish: (id: number) => void
}

export function useDashboardContext() {
  return useOutletContext<DashboardContext>()
}
