import { useState } from "react"
import type { ChangeEvent } from "react"
import type { FormEvent } from "react"
import { Form } from "@remix-run/react"

import { Backdrop } from "../backdrop"
import { sendSignInWithEmailLink } from "~/client/auth.client"

interface EmailInputProps {
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void
  value: string
  placeholder?: string
  disabled?: boolean
}

export function EmailInput({
  handleChange,
  value,
  placeholder = "Your email address",
  disabled = false,
}: EmailInputProps) {
  return (
    <input
      type="email"
      name="email"
      className="h-12 w-full border border-borderLightGray rounded-lg px-5 outline-none placeholder:font-extralight font-normal text-textRegular text-lg placeholder:text-textExtraLight focus:outline-none"
      placeholder={placeholder}
      onChange={handleChange}
      value={value}
      disabled={disabled}
    />
  )
}

export function EmailRequest() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (typeof document === "undefined") return

    e.preventDefault()

    try {
      setLoading(true)
      if (error) setError(false)
      await sendSignInWithEmailLink(email)
      setLoading(false)
      setSuccess(true)
    } catch (error) {
      setLoading(false)
      setError(true)
      if (success) setSuccess(false)
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
  }

  return (
    <>
      <Form className="px-5" onSubmit={handleSubmit}>
        <EmailInput
          handleChange={handleChange}
          value={email}
          disabled={loading}
        />
        <button
          type="submit"
          className={`btn-orange w-full mt-14 h-12 rounded-full text-lg ${
            !email || loading || success ? "opacity-20" : "opacity-100"
          }`}
          disabled={!email || loading || success}
        >
          Submit
        </button>

        {error && !success && (
          <p className="error mt-1">
            Error occurred while attempting to send a sign-in link to your
            email. Please try again.
          </p>
        )}

        {success && !error && (
          <p className="success mt-1">
            We have sent you a sign-in link, please check your email and proceed
            to sign in.
          </p>
        )}
      </Form>
      {loading && <Backdrop withSpinner={true} bgWhite={true} opacity={30} />}
    </>
  )
}
