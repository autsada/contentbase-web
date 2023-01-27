import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import type { ActionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { ClientOnly, useAuthenticityToken, useHydrated } from "remix-utils"
import { Form, useCatch, useFetcher } from "@remix-run/react"
import { Web3Modal } from "@web3modal/react"
import { useWeb3Modal } from "@web3modal/react"
import { useAccount, useDisconnect } from "wagmi"

import { Backdrop } from "~/components/backdrop"
import ErrorComponent from "~/components/error"
import { ethereumClient } from "~/ethereum/client"
import { createUserIfNotExist, createCustomToken } from "~/server/auth.server"
import { signInWithToken } from "~/client/auth.client"
import { WALLET_CONNECT_PROJECT_ID } from "~/constants"

// We need Javascript client side to run the component
export const handle = { hydrate: true }

export async function action({ request }: ActionArgs) {
  // Get a wallet address from the request
  const form = await request.formData()
  const { address } = Object.fromEntries(form) as { address: string }

  if (address) {
    const user = await createUserIfNotExist(address)
    const token = await createCustomToken(user.uid)
    return json({ token })
  } else {
    return json({ token: null })
  }
}

export default function Wallet() {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const fetcher = useFetcher<typeof action>()
  const token = fetcher?.data?.token
  const csrf = useAuthenticityToken()
  const hydrated = useHydrated()
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  // When users connected their wallet, submit the address to the server for processing Firebase Auth login
  useEffect(() => {
    if (isConnected && !!address) {
      fetcher.submit({ address }, { method: "post" })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected])

  async function openModal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await open()
  }

  // When we get a token back from the server, log the user in
  useEffect(() => {
    if (isConnected && token) {
      const login = async () => {
        try {
          setProcessing(true)
          const credential = await signInWithToken(token)
          const idToken = await credential.user.getIdToken()
          // Send the `idToken` and `csrf` token to the `action` function on the server.
          fetcher.submit(
            { idToken, csrf },
            { method: "post", action: "/login" }
          )
        } catch (error) {
          setError(
            "Error occurred while attempting to login. Please try again."
          )
          setProcessing(false)
          disconnect()
        }
      }

      login()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isConnected, csrf])

  return (
    <div className="page p-10">
      <ClientOnly fallback={<p className="text-textLight">Loading...</p>}>
        {() => (
          <>
            <Form
              className="btn-orange flex justify-between items-center w-56 h-12 rounded-full mx-auto px-5 hover:bg-orange-600"
              onSubmit={openModal}
            >
              <button
                type="submit"
                className="w-full text-white text-xl focus:outline-none"
                disabled={!hydrated}
              >
                {processing ? "Processing Login" : "Connect Wallet"}
              </button>
            </Form>
            {error && <p className="error mt-2">{error}</p>}

            {/* The Modal to connect to wallet */}
            <Web3Modal
              projectId={WALLET_CONNECT_PROJECT_ID}
              ethereumClient={ethereumClient}
            />
          </>
        )}
      </ClientOnly>

      {processing && (
        <Backdrop withSpinner={true} bgWhite={true} opacity={80} />
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
