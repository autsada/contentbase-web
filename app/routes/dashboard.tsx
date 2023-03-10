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
  useFetcher,
} from "@remix-run/react"
import type { UserRecord } from "firebase-admin/auth"
import { onSnapshot, doc } from "firebase/firestore"

import { UploadModal } from "~/components/upload/upload-modal"
import ErrorComponent from "~/components/error"
import { checkAuthenticatedAndReady } from "~/server/auth.server"
import { getBalance } from "~/graphql/server"
import { listPublishesByCreator } from "~/graphql/public-apis"
import {
  publishesCollection,
  firestore,
  clientAuth,
} from "~/client/firebase.client"
import type { Profile, Account, Publish } from "~/types"
import type { UploadType } from "~/components/upload/select-type"
import type { DeletePublishAction } from "./dashboard/delete-publish"

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

export default function Dashboard() {
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>()
  const [uploadType, setUploadType] = useState<UploadType>("SelectType")
  const [displayedPublish, setDisplayedPublish] = useState<Publish>()
  const [deletingId, setDeletingId] = useState<number>()
  const [showDeleteError, setShowDeleteError] = useState(false)

  const data = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const revalidator = useRevalidator()
  const deletePublishFetcher = useFetcher<DeletePublishAction>()
  const isDeleting =
    deletePublishFetcher?.state === "submitting" ||
    deletePublishFetcher?.state === "loading"

  // Open upload modal if start upload is true
  useEffect(() => {
    if (data?.startUpload) {
      setUploadModalVisible(true)
    }
  }, [data?.startUpload])

  // Listen to the publish doc in Firestore, and revalidate states.
  useEffect(() => {
    if (typeof document === "undefined" || !displayedPublish?.id) return

    const unsubscribe = onSnapshot(
      doc(firestore, publishesCollection, `${displayedPublish.id}`),
      {
        next: (doc) => {
          revalidator.revalidate()
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
  }, [displayedPublish])

  /**
   * `cb` is a callback function to run before closing the modal
   */
  const closeUploadModal = useCallback((cb?: () => void) => {
    if (cb) {
      cb()
    }
    setUploadModalVisible(false)
    setDisplayedPublish(undefined)
    setUploadType("SelectType")
  }, [])

  const displayPublish = useCallback(
    (publishId: number) => {
      if (data?.publishes?.length > 0) {
        const p = data.publishes.find((pub) => pub.id === publishId) as
          | Publish
          | undefined
        if (p) {
          setDisplayedPublish(p)
          setUploadType(p?.kind || "Video")
          setUploadModalVisible(true)
        }
      }
    },
    [data?.publishes]
  )

  // When the delete is done, reset the state
  useEffect(() => {
    if (deletePublishFetcher?.data?.status === "Ok") {
      setDeletingId(undefined)
    }
    if (deletePublishFetcher?.data?.status === "Error") {
      setShowDeleteError(true)
    }
  }, [deletePublishFetcher?.data])

  const deletePublish = useCallback(async (publish?: Publish) => {
    try {
      if (!publish || !clientAuth) return

      // Get user's id token
      const user = clientAuth.currentUser
      const idToken = await user?.getIdToken()

      // At this point we should have id token as we will force user to reauthenticate if they don't earlier since they enter the dashboard page.
      if (!idToken) return

      setDeletingId(publish.id)
      deletePublishFetcher.submit(
        { idToken, publishId: publish.id.toString() },
        { method: "post", action: "/dashboard/delete-publish" }
      )
    } catch (error) {
      console.error(error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          displayPublish,
          displayingId: displayedPublish?.id,
          deletingId,
          isDeleting,
          showDeleteError,
          setShowDeleteError,
        }}
      />

      {uploadModalVisible && (
        <UploadModal
          closeModal={closeUploadModal}
          uploadType={uploadType}
          setUploadType={setUploadType}
          displayedPublish={displayedPublish}
          deletePublish={deletePublish}
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
  displayPublish: (id: number) => void
  displayingId: number
  deletingId: number
  isDeleting: boolean
  showDeleteError: boolean
  setShowDeleteError: (s: boolean) => void
}

export function useDashboardContext() {
  return useOutletContext<DashboardContext>()
}
