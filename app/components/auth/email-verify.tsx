import { useState, useEffect, useCallback } from "react"
import type { FormEvent } from "react"
import type { ChangeEvent } from "react"
import { useFetcher, Link } from "@remix-run/react"

import { EmailInput } from "./email-request"
import { EMAIL_KEY_NAME } from "~/constants"
import { Backdrop } from "../backdrop"
import { verifyEmailAddress } from "~/client/auth.client"
import { useAuthenticityToken } from "remix-utils"
import type { LoginActionType } from "~/routes/login"

export default function EmailVerify() {
  const [savedEmail, setSavedEmail] = useState<string | undefined>()
  const [email, setEmail] = useState("")
  const [processing, setProcessing] = useState(false)
  const [sucess, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const emailLink = window.location.href
  const fetcher = useFetcher<LoginActionType>()
  const loginData = fetcher?.data
  const csrf = useAuthenticityToken()

  // Get user's email from localstorage
  useEffect(() => {
    const savedEmail = window.localStorage.getItem(EMAIL_KEY_NAME)
    if (savedEmail) setSavedEmail(savedEmail)
    else setSavedEmail("")
  }, [])

  const verifyEmail = useCallback(async (email: string, link: string) => {
    try {
      setProcessing(true)
      const idToken = await verifyEmailAddress(email, link)
      console.log("id token -->", idToken)
      setProcessing(false)
      if (!idToken) {
        setError("Verify failed")
      } else {
        setSuccess(true)
        window.localStorage.removeItem(EMAIL_KEY_NAME)
        fetcher.submit({ idToken, csrf }, { method: "post", action: "/login" })
      }
    } catch (error: any) {
      console.log("error -->", error.message)
      setProcessing(false)
      setError("Verify failed, please try again")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If email was already saved in localstorage (user open the verify link in the same device as they used to request the signin)
  useEffect(() => {
    if (savedEmail && emailLink) {
      verifyEmail(savedEmail, emailLink)
    }
  }, [savedEmail, emailLink, verifyEmail])

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email || !emailLink) return
    verifyEmail(email, emailLink)
  }

  return (
    <>
      <Backdrop withSpinner={true} bgWhite={false} opacity={30} />
      {/* If user opens the link in a different device (doesn't have email saved in localstorage) */}
      <div className="absolute inset-0 z-50 flex flex-col justify-center items-center">
        <div className="relative w-[90%] max-w-[360px] mx-auto bg-white rounded-2xl">
          {savedEmail === "" && (
            <fetcher.Form className="p-6" onSubmit={handleSubmit}>
              <EmailInput
                handleChange={handleChange}
                value={email}
                placeholder="Please confirm your email address"
              />
              <button
                type="submit"
                className={`btn-orange w-full mt-8 h-12 rounded-full text-lg ${
                  !email || processing ? "opacity-40" : "opacity-100"
                }`}
                disabled={!email || processing}
              >
                Confirm
              </button>
            </fetcher.Form>
          )}

          {sucess && (
            <div className="py-5">
              <p className="success mt-1">Verify success</p>
            </div>
          )}

          {(error || (loginData && loginData.error)) && (
            <div className="py-6">
              <p className="error mb-3">Sorry, failed to verify</p>
              <Link to="/connect/email" replace={true}>
                close
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
