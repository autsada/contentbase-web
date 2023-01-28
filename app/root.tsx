import React, { useEffect } from "react"
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
} from "@remix-run/react"
import { AuthenticityTokenProvider, createAuthenticityToken } from "remix-utils"
import type { UserRecord } from "firebase-admin/auth"
import { WagmiConfig } from "wagmi"
import { Web3Modal } from "@web3modal/react"

import ErrorComponent from "./components/error"
import { Nav } from "./components/nav"
import { getSession, commitSession } from "./server/session.server"
import { getUser } from "./server/auth.server"
import { ethereumClient, wagmiClient } from "./ethereum/client"
import { LOGGED_IN_KEY, WALLET_CONNECT_PROJECT_ID } from "./constants"
import type { LoaderData } from "./types"
import styles from "./styles/app.css"

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
  return [{ rel: "stylesheet", href: styles }]
}

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request)
  const session = await getSession(request.headers.get("cookie"))
  const token = createAuthenticityToken(session)
  return json<LoaderData>(
    {
      user,
      csrf: token,
      ENV: {
        // NODE_ENV: process.env.NODE_ENV,
        NODE_ENV: "test",
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
      <body>{children}</body>
    </html>
  )
}

export default function App() {
  const loaderData = useLoaderData<LoaderData>()
  const csrf = loaderData?.csrf
  const user = loaderData?.user as UserRecord | null
  const ENV = loaderData?.ENV

  // Listen to storage event to update authenticaiton state in all tabs
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

  return (
    <AuthenticityTokenProvider token={csrf || ""}>
      <WagmiConfig client={wagmiClient}>
        <Document>
          <Nav user={user} />
          <Outlet />
          <ScrollRestoration />
          <script
            // Add `ENV` to the window object
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(ENV)}`,
            }}
          />
          <Scripts />
          <LiveReload />

          {/* The Modal to connect to wallet */}
          <Web3Modal
            projectId={WALLET_CONNECT_PROJECT_ID}
            ethereumClient={ethereumClient}
          />
        </Document>
      </WagmiConfig>
    </AuthenticityTokenProvider>
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
