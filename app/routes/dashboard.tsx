import { useState, useCallback, useEffect } from "react"
import { redirect, json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import {
  Outlet,
  useCatch,
  useLoaderData,
  useLocation,
  useOutletContext,
  Link,
  useRevalidator,
} from "@remix-run/react"
import type { UserRecord } from "firebase-admin/auth"
import { onSnapshot, doc } from "firebase/firestore"

import { UploadModal } from "~/components/upload/upload-modal"
import ErrorComponent from "~/components/error"
import { checkAuthenticatedAndReady } from "~/server/auth.server"
import { getBalance } from "~/graphql/server"
import { listPublishesByCreator } from "~/graphql/public-apis"
import { playbacksCollection, firestore } from "~/client/firebase.client"
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
  const { pathname } = useLocation()
  const revalidator = useRevalidator()

  // Open upload modal if start upload is true
  useEffect(() => {
    if (data?.startUpload) {
      setUploadModalVisible(true)
    }
  }, [data?.startUpload])

  // Listen to the playback in Firestore and if the playback is updated, call the `API` service to query the publish.
  useEffect(() => {
    if (typeof document === "undefined" || !selectedPublish?.id) return

    const unsubscribe = onSnapshot(
      doc(firestore, playbacksCollection, `${selectedPublish.id}`),
      {
        next: (doc) => {
          if (doc.exists()) {
            revalidator.revalidate()
          }
        },
        error: (error) => {
          console.error(error)
        },
      }
    )

    return () => {
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPublish])

  /**
   * `cb` is a callback function to run before closing the modal
   */
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
      {/* Tab to select by content type */}
      <div className="py-4 flex max-w-full w-full items-center overflow-x-auto scrollbar-hide">
        <Link to="/dashboard" preventScrollReset={true}>
          <div
            className={`${
              pathname === "/dashboard" ? "border-b-2" : "border-none"
            } mx-4 border-borderExtraDarkGray w-max`}
          >
            <h6
              className={`text-base ${
                pathname === "/dashboard"
                  ? "text-textDark"
                  : "text-textExtraLight"
              }`}
            >
              All
            </h6>
          </div>
        </Link>
        <Link to="/dashboard/videos" preventScrollReset={true}>
          <div
            className={`${
              pathname === "/dashboard/videos" ? "border-b-2" : "border-none"
            } mx-4 border-borderExtraDarkGray w-max`}
          >
            <h6
              className={`text-base ${
                pathname === "/dashboard/videos"
                  ? "text-textDark"
                  : "text-textExtraLight"
              }`}
            >
              Videos
            </h6>
          </div>
        </Link>
        <Link to="blogs" preventScrollReset={true}>
          <div
            className={`${
              pathname === "/dashboard/blogs" ? "border-b-2" : "border-none"
            } mx-4 border-borderExtraDarkGray w-max`}
          >
            <h6
              className={`text-base ${
                pathname === "/blogs" ? "text-textDark" : "text-textExtraLight"
              }`}
            >
              Blogs
            </h6>
          </div>
        </Link>
      </div>

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

export function CatchBoundary() {
  const caught = useCatch()

  return <ErrorComponent error={caught.statusText} />
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <ErrorComponent error={error.message} />
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
