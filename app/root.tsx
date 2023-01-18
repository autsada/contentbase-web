import React from "react"
import type { MetaFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react"

import { Nav } from "./components/nav"
import { Connect } from "./components/connect"
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

function Document({
  children,
  title = `ContentBase Video Sharing Platform`,
  openConnectModal,
}: {
  children: React.ReactNode
  title?: string
  openConnectModal?: (open: boolean) => void
}) {
  return (
    <html lang="en" className="text-neutral-600 bg-white font-sans">
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        <Nav openConnectModal={openConnectModal} />
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function App() {
  const [isOpen, setIsOpen] = React.useState(false)

  const openConnectModal = React.useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  return (
    <Document openConnectModal={openConnectModal}>
      <Outlet />
      {isOpen && <Connect setOpen={openConnectModal} />}
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
