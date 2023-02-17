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
  // useFetchers,
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

import ErrorComponent from "./components/error"
import { Nav } from "./components/nav"
import RightDrawer from "./components/drawers/right-drawer"
import { Backdrop } from "./components/backdrop"
import { getSession, commitSession } from "./server/session.server"
import { getUser } from "./server/auth.server"
import { ethereumClient, wagmiClient } from "./ethereum/client"
import { queryAccountByUid } from "./graphql/public-apis"
import { firestore } from "./client/firebase.client"
import {
  CURRENT_PROFILE,
  INITIAL_VISIT_ID,
  LOGGED_IN_KEY,
  WALLET_CONNECT_PROJECT_ID,
} from "./constants"
import styles from "./styles/app.css"
import carouselStyles from "react-responsive-carousel/lib/styles/carousel.min.css"
import { Welcome } from "./components/welcome"
import { getBalance } from "./graphql/server"
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
  ]
}

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request)
  const session = await getSession(request.headers.get("cookie"))
  const token = createAuthenticityToken(session)
  const account = user ? await queryAccountByUid(user.uid) : null
  const profile =
    account && account.profiles.length > 0
      ? ((account.profiles.find((ac) => ac?.default) ||
          account.profiles[0]) as Profile)
      : null
  let address = ""
  let balance = ""
  let hasProfile: boolean | undefined = undefined

  if (account) {
    address = account.address
    balance = address ? await getBalance(address) : ""
    hasProfile = !!profile
  }

  return json<LoaderData>(
    {
      user,
      csrf: token,
      account,
      profile,
      balance,
      hasProfile,
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
  const [loggedInProfile, setLoggedInProfile] = useState<Profile | null>(
    () => profile
  )

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
      doc(firestore, "activities", formattedAddress),
      () => {
        revalidator.revalidate()
      }
    )

    return () => {
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  /**
   * When a profile that fetched from the server changes, set the logged in profile in the state.
   */
  useEffect(() => {
    setLoggedInProfile(profile)
  }, [profile])

  const switchProfile = useCallback((p: Profile) => {
    window.localStorage.setItem(CURRENT_PROFILE, `${p.id}`)
    setLoggedInProfile(p)
  }, [])

  return (
    <AuthenticityTokenProvider token={csrf || ""}>
      <WagmiConfig client={wagmiClient}>
        <Document>
          <body
            className={isRightDrawerOpen ? "overflow-hidden" : "overflow-auto"}
          >
            <Nav
              user={user}
              openDrawer={openRightDrawer}
              profile={loggedInProfile}
            />
            <Outlet
              context={{
                welcomeModalVisible,
                setWelcomeModalVisible,
                loggedInProfile: loggedInProfile,
                switchProfile,
                account: loaderData?.account,
                balance: loaderData?.balance,
                hasProfile: loaderData?.hasProfile,
              }}
            />
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

                  {/* Right Drawer */}
                  <>
                    <Backdrop
                      className={`${
                        !isRightDrawerOpen
                          ? "transition-all duration-300 hidden"
                          : "transition-all duration-300 block"
                      }`}
                      opacity={!isRightDrawerOpen ? 0 : 30}
                    />
                    <RightDrawer
                      openDrawer={openRightDrawer}
                      className={
                        !isRightDrawerOpen ? "-right-[200%]" : "right-0"
                      }
                      profile={loggedInProfile}
                      profiles={loaderData?.account?.profiles as Profile[]}
                      switchProfile={switchProfile}
                    />
                  </>
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
  loggedInProfile: Profile
  switchProfile: (p: Profile) => void
  account: Account
  balance: string | undefined
  hasProfile: boolean | undefined
}

export function useAppContext() {
  return useOutletContext<AppContext>()
}
