import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import type { ActionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { ClientOnly, useAuthenticityToken, useHydrated } from "remix-utils"
import { useCatch, useFetcher } from "@remix-run/react"
import { useWeb3Modal } from "@web3modal/react"
import { useAccount, useDisconnect } from "wagmi"

import { Backdrop } from "~/components/backdrop"
import ErrorComponent from "~/components/error"
import { InfoWithSpinner } from "~/components/info-spinner"
import { createUserIfNotExist, createCustomToken } from "~/server/auth.server"
import { signInWithToken } from "~/client/auth.client"
import type { AccountType } from "~/types"

// We need Javascript client side to run the component
export const handle = { hydrate: true }

export async function action({ request }: ActionArgs) {
  try {
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
  } catch (error) {
    return new Response("Something went wrong")
  }
}

export default function Wallet() {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const createUserFetcher = useFetcher<typeof action>()
  const token = createUserFetcher?.data?.token
  const logInFetcher = useFetcher()
  const csrf = useAuthenticityToken()
  const hydrated = useHydrated()
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  // When users connected their wallet, submit the address to the server for processing Firebase Auth login
  useEffect(() => {
    if (isConnected && !!address) {
      createUserFetcher.submit({ address }, { method: "post" })
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
          const accountType: AccountType = "WALLET"
          // Send the `idToken`, `accountType` and `csrf` token to the `login` action on the server.
          logInFetcher.submit(
            { idToken, accountType, csrf },
            { method: "post", action: "/auth/login" }
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
          <logInFetcher.Form onSubmit={openModal}>
            <button
              type="submit"
              className="btn-orange w-56 h-12 rounded-full text-xl focus:outline-none"
              disabled={!hydrated}
            >
              {processing ? "Processing Log in" : "Connect Wallet"}
            </button>
            {error && <p className="error mt-2">{error}</p>}
          </logInFetcher.Form>
        )}
      </ClientOnly>

      {processing && (
        <Backdrop opacity={50}>
          <InfoWithSpinner header="Processing Log in" />
        </Backdrop>
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
