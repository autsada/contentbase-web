import React from "react"
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

import { getSession, commitSession } from "./server/session.server"
import type { LoaderData } from "./types"
import styles from "./styles/app.css"
import "react-phone-number-input/style.css"

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
  const session = await getSession(request.headers.get("cookie"))
  const token = createAuthenticityToken(session)
  return json<LoaderData>(
    {
      csrf: token,
    },
    { headers: { "Set-Cookie": await commitSession(session) } }
  )
}

function Document({
  children,
  title = `ContentBase Video Sharing Platform`,
}: {
  children: React.ReactNode
  title?: string
}) {
  const loaderData = useLoaderData<LoaderData>()
  const csrf = loaderData?.csrf

  return (
    <AuthenticityTokenProvider token={csrf || ""}>
      <html lang="en" className="text-textRegular bg-white font-sans">
        <head>
          <Meta />
          <title>{title}</title>
          <Links />
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </AuthenticityTokenProvider>
  )
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div>
        <h1>
          {caught.status} {caught.statusText}
        </h1>
      </div>
    </Document>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return (
    <Document title="Oops! ...something not right">
      <div>
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  )
}
