import React, { useState, useEffect, useMemo, useCallback } from "react"
import type { MetaFunction, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useTransition,
  useRevalidator,
  useOutletContext,
} from "@remix-run/react"
import { AuthenticityTokenProvider, createAuthenticityToken } from "remix-utils"
import type { UserRecord } from "firebase-admin/auth"
import { ClientOnly } from "remix-utils"
import { WagmiConfig } from "wagmi"
import { Web3Modal } from "@web3modal/react"
import NProgress from "nprogress"
import { onSnapshot, doc } from "firebase/firestore"
import { ToastContainer } from "react-toastify"

import ErrorComponent from "./components/error"
import { MainNav } from "./components/navs/mainnav"
import RightDrawer from "./components/navs/right-drawer"
import { Backdrop } from "./components/backdrop"
import { Welcome } from "./components/welcome"
import BottomTab from "./components/navs/bottom-tab"
import { getSession, commitSession } from "./server/session.server"
import { getUser } from "./server/auth.server"
import { ethereumClient, wagmiClient } from "./ethereum/client"
import { queryAccountByUid } from "./graphql/public-apis"
import { activitiesCollection, firestore } from "./client/firebase.client"
import {
  INITIAL_VISIT_ID,
  LOGGED_IN_KEY,
  WALLET_CONNECT_PROJECT_ID,
} from "./constants"
import styles from "./styles/app.css"
import carouselStyles from "react-responsive-carousel/lib/styles/carousel.min.css"
import toastStyles from "react-toastify/dist/ReactToastify.css"
import type { Account, LoaderData, Profile } from "./types"

export const meta: MetaFunction = () => {
  const description = `Share you awesome content and get like/paid`
  return {
    charset: "utf-8",
    viewport: "width=device-width,initial-scale=1",
    description,
    keywords: "ContentBase,Web3,Video Sharing",
    "twitter:image": "",
    "twitter:card": "summary_large_image",
    "twitter:creator": "",
    "twitter:site": "",
    "twitter:title": "ContentBase",
    "twitter:description": description,
  }
}

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: carouselStyles },
    { rel: "stylesheet", href: toastStyles },
  ]
}

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request)
  const session = await getSession(request.headers.get("cookie"))
  const token = createAuthenticityToken(session)
  const account = user ? await queryAccountByUid(user.uid) : null

  return json<LoaderData>(
    {
      user,
      csrf: token,
      account,
      profile: account?.profile, // This is the loggedIn profile
      ENV: {
        NODE_ENV: process.env.NODE_ENV,
        // NODE_ENV: "test",
      },
    },
    { headers: { "Set-Cookie": await commitSession(session) } }
  )
}

export function Document({
  children,
  title = `ContentBase Video Sharing Platform`,
}: {
  children: React.ReactNode
  title?: string
}) {
  return (
    <html lang="en" className="text-textRegular bg-white font-sans">
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <>{children}</>
    </html>
  )
}

export default function App() {
  const loaderData = useLoaderData<LoaderData>()
  const csrf = loaderData?.csrf
  const user = loaderData?.user as UserRecord | null
  const uid = user?.uid
  const address = loaderData?.account?.address
  const profile = loaderData?.profile as Profile | null

  const [welcomeModalVisible, setWelcomeModalVisible] = useState(() => !address)
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false)

  const revalidator = useRevalidator()
  const transition = useTransition()
  // const fetchers = useFetchers()

  /**
   * Check whether should show first visit welcome modal
   */
  useEffect(() => {
    if (typeof document === "undefined") return

    const initialVisit = window.localStorage.getItem(INITIAL_VISIT_ID)

    if (!initialVisit) {
      setWelcomeModalVisible(true)
    } else {
      setWelcomeModalVisible(false)
    }
  }, [])

  /**
   * When user logged in, write `loggedIn` key to localStorage so all opened tabs will be reloaded to update session state.
   */
  useEffect(() => {
    if (typeof document === "undefined") return

    const loggedIn = window.localStorage.getItem(LOGGED_IN_KEY)

    if (uid) {
      if (!loggedIn) {
        window.localStorage.setItem(LOGGED_IN_KEY, Math.random().toString())
      }
    }
  }, [uid])

  /**
   * Listen to storage event to update authenticaiton state in all tabs
   */
  useEffect(() => {
    if (typeof document === "undefined") return
    const storageEventHanlder = (e: StorageEvent) => {
      if (e.key === LOGGED_IN_KEY) {
        window.location.reload()
      }
    }
    window.addEventListener("storage", storageEventHanlder)

    return () => {
      if (typeof document !== "undefined") {
        window.removeEventListener("storage", storageEventHanlder)
      }
    }
  }, [])

  /**
   * This gets the state of every fetcher active on the app and combine it with
   * the state of the global transition (Link and Form), then use them to
   * determine if the app is idle or if it's loading.
   * Here we consider both loading and submitting as loading.
   */
  const state = useMemo<"idle" | "loading">(
    function getGlobalState() {
      let states = [
        transition.state,
        // ...fetchers.map((fetcher) => fetcher.state),
      ]
      if (states.every((state) => state === "idle")) return "idle"
      return "loading"
    },
    [transition.state]
  )

  // Handle progress bar
  useEffect(() => {
    // and when it's something else it means it's either submitting a form or
    // waiting for the loaders of the next location so we start it
    if (state === "loading") {
      NProgress.start()
      if (isRightDrawerOpen) setIsRightDrawerOpen(false)
    }
    // when the state is idle then we can to complete the progress bar
    if (state === "idle") NProgress.done()
  }, [state, isRightDrawerOpen])

  const openRightDrawer = useCallback((open: boolean) => {
    setIsRightDrawerOpen(open)
  }, [])

  // Listen to activities occurred to the address and revalidate the loader data
  useEffect(() => {
    if (typeof document === "undefined" || !address) return
    const formattedAddress = address.toLowerCase()

    const unsubscribe = onSnapshot(
      doc(firestore, activitiesCollection, formattedAddress),
      () => {
        revalidator.revalidate()
      }
    )

    return () => {
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  return (
    <AuthenticityTokenProvider token={csrf || ""}>
      <WagmiConfig client={wagmiClient}>
        <Document>
          <body
            className={isRightDrawerOpen ? "overflow-hidden" : "overflow-auto"}
          >
            <MainNav
              user={user}
              openDrawer={openRightDrawer}
              profile={profile}
              isDrawerOpen={isRightDrawerOpen}
            />
            {/* Right Drawer */}
            <>
              <Backdrop
                className={`${
                  !isRightDrawerOpen
                    ? "transition-all duration-300 hidden"
                    : "transition-all duration-300 block"
                }`}
                opacity={!isRightDrawerOpen ? 0 : 30}
                zIndex="z-[10000]"
                onClickBackdrop={openRightDrawer.bind(undefined, false)}
              />
              <RightDrawer
                openDrawer={openRightDrawer}
                className={!isRightDrawerOpen ? "-right-[200%]" : "right-0"}
                profile={profile}
                profiles={loaderData?.account?.profiles as Profile[]}
              />
            </>
            <Outlet
              context={{
                welcomeModalVisible,
                setWelcomeModalVisible,
                user: loaderData?.user,
                account: loaderData?.account,
                profile: loaderData?.profile,
              }}
            />
            <BottomTab />
            <ScrollRestoration />
            <script
              // Add `ENV` to the window object
              dangerouslySetInnerHTML={{
                __html: `window.ENV = ${JSON.stringify(loaderData?.ENV)}`,
              }}
            />
            <Scripts />
            <LiveReload />

            {/* Welcome modal */}
            {welcomeModalVisible && <Welcome />}

            <ClientOnly>
              {() => (
                <>
                  {/* The Modal to connect to wallet */}
                  <Web3Modal
                    projectId={WALLET_CONNECT_PROJECT_ID}
                    ethereumClient={ethereumClient}
                  />

                  {/* Toast */}
                  <ToastContainer
                    position="bottom-center"
                    autoClose={1000}
                    hideProgressBar={true}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable={false}
                    pauseOnHover={false}
                    icon={false}
                  />
                </>
              )}
            </ClientOnly>
          </body>
        </Document>
      </WagmiConfig>
    </AuthenticityTokenProvider>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  return (
    <Document>
      <body>
        <ErrorComponent error={caught.statusText} />
      </body>
    </Document>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return (
    <Document>
      <body>
        <ErrorComponent error={error.message} />
      </body>
    </Document>
  )
}

export type AppContext = {
  welcomeModalVisible: boolean
  setWelcomeModalVisible: (open: boolean) => void
  user: UserRecord | null
  account: Account | null
  profile: Profile | null
}

export function useAppContext() {
  return useOutletContext<AppContext>()
}
