import { useState, useEffect, useMemo } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { Form, useFetcher } from "@remix-run/react"
import PhoneInput, {
  getCountryCallingCode,
  isValidPhoneNumber,
} from "react-phone-number-input/input"
import _ from "lodash"
import { IoCaretDownOutline } from "react-icons/io5"
import type { Country } from "react-phone-number-input"
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import type { ConfirmationResult } from "firebase/auth"

import OtpInput from "./opt-input"
import { clientAuth } from "~/client/firebase.client"
import { getCountryNames } from "~/utils"
import { useAuthenticityToken } from "remix-utils"

interface Props {
  country?: Country | null
  hydrated: boolean
}

function Option({ value, name }: { value: Country | ""; name: string }) {
  return (
    <option value={value} className="font-normal text-textRegular text-base">
      {name}
    </option>
  )
}

export function PhoneAuth({ country: defaultCountry, hydrated }: Props) {
  const [country, setCountry] = useState<Country | undefined>()
  const [phoneNumber, setPhoneNumber] = useState<string>()
  const [isValid, setIsValid] = useState(false)
  const [requestCodeProcessing, setRequestCodeProcessing] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult>()
  const [otpError, setOtpError] = useState("")
  const [userOtp, setUserOtp] = useState("")
  const [verifyOtpProcessing, setVerifyOtpProcessing] = useState(false)
  const [verifyError, setVerifyError] = useState("")

  const fetcher = useFetcher()
  const csrf = useAuthenticityToken()

  // If default country is available, set it to the state
  useEffect(() => {
    if (defaultCountry) {
      setCountry(defaultCountry)
    }
  }, [defaultCountry])

  function handleSelectCountry(e: ChangeEvent<HTMLSelectElement>) {
    setCountry(e.target.value as Country)
  }

  const validatePhoneNumberDebounce = useMemo(
    () => _.debounce(validatePhoneNumber, 500),
    []
  )

  function validatePhoneNumber(phoneNumber: string, country: Country) {
    const valid = isValidPhoneNumber(phoneNumber, country)
    setIsValid(valid)
  }

  // Validate phone number
  useEffect(() => {
    if (phoneNumber && country) {
      validatePhoneNumberDebounce(phoneNumber, country)
    }
  }, [phoneNumber, country, validatePhoneNumberDebounce])

  // When phone number is valid, blur the input
  useEffect(() => {
    if (isValid) {
      const inputDivEl = document.getElementById("phone-input")
      if (inputDivEl) {
        const inputEl = inputDivEl.children[0] as HTMLInputElement
        if (inputEl) inputEl.blur()
      }
    }
  }, [isValid])

  /**
   * @dev There are 2 steps to login with phone number.
   * @dev 1. User request a verification code
   * @dev 2. User confirm the verification code they received
   */

  /**
   * The 1 step: Request a verification code.
   */
  async function requestVerificationCode() {
    try {
      if (!phoneNumber) throw new Error("Phone number is required.")

      // Start the process
      setRequestCodeProcessing(true)
      if (otpError) setOtpError("")

      // Create a new recaptcha instance if not already
      const recaptchaVerifier = new RecaptchaVerifier(
        "sign-in-button",
        {
          size: "invisible",
          callback: function () {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            // onRecaptchaSolved(response)
          },
        },
        clientAuth
      )

      // Store the instance on the window object
      window.recaptchaVerifier = recaptchaVerifier
      const widgetId = await recaptchaVerifier.render()
      window.widgetId = widgetId

      const confirmation = await signInWithPhoneNumber(
        clientAuth,
        phoneNumber,
        recaptchaVerifier
      )
      setIsOtpSent(true)
      setConfirmationResult(confirmation)
      setRequestCodeProcessing(false)
    } catch (error) {
      setOtpError("Error attempting to send OTP, please try again.")
      setRequestCodeProcessing(false)
      if (isOtpSent) setIsOtpSent(false)

      // Reset the recaptcha so the user can try again
      if (window.grecaptcha) {
        window.grecaptcha.reset(window.widgetId)
      }
    }
  }

  function resetStatesBeforeResendCode() {
    if (requestCodeProcessing) setRequestCodeProcessing(false)
    if (otpError) setOtpError("")
    if (verifyOtpProcessing) setVerifyOtpProcessing(false)
    if (verifyError) setVerifyError("")
  }

  function resendVerificationCode() {
    // Destroy the old recaptcha if any
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
    }
    resetStatesBeforeResendCode()
    requestVerificationCode()
  }

  function handleOtpChange(value: string) {
    setUserOtp(value)
  }

  /**
   * The 2 step: Verify the verification code
   */
  async function verifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!confirmationResult || !userOtp || userOtp.length !== 6) return

    try {
      setVerifyOtpProcessing(true)
      const result = await confirmationResult.confirm(userOtp)
      const idToken = await result.user.getIdToken()
      // Send the `idToken` and `csrf` token to the `action` function on the server.
      fetcher.submit({ idToken, csrf }, { method: "post", action: "/login" })
    } catch (error) {
      setVerifyOtpProcessing(false)
      setVerifyError("Verify code failed")
    }
  }

  return (
    <div className="relative px-5">
      {otpError && <p className="error absolute -top-5 pl-4">{otpError}</p>}
      <div className="border border-borderLightGray rounded-lg">
        <div
          className={`relative px-4 h-10 flex items-center ${
            country ? "border-b border-borderLightGray" : ""
          }`}
        >
          <select
            value={country}
            onChange={handleSelectCountry}
            className="w-full bg-transparent text-lg appearance-none focus:outline-none"
          >
            <Option value="" name="Select country" />
            {getCountryNames().map((c) => (
              <Option key={c.code} value={c.code as Country} name={c.name} />
            ))}
          </select>
          <IoCaretDownOutline
            color="#525252"
            className="absolute -z-10 right-4"
          />
        </div>
        {country && (
          <div className="h-12 px-2 flex items-center">
            <div className="h-full w-20 border-r border-borderLight flex justify-center items-center">
              <p className="text-lg text-textRegular">
                {country && `+${getCountryCallingCode(country)}`}
              </p>
            </div>
            <div id="phone-input" className="h-full flex-grow">
              <PhoneInput
                country={country}
                value={phoneNumber}
                onChange={setPhoneNumber}
                defaultCountry={!defaultCountry ? undefined : defaultCountry}
                placeholder="Enter your phone number"
                className="w-full h-full leading-12 p-0 pl-4 appearance-none font-normal text-textRegular text-lg placeholder:font-extralight placeholder:text-textExtraLight focus:outline-none"
              />
            </div>
          </div>
        )}
        {country && phoneNumber && (
          <p className="absolute font-thin text-sm pl-4 text-error">
            {!isValid ? "Invalid number" : <>&nbsp;</>}
          </p>
        )}
      </div>

      {phoneNumber && (
        <div className="relative mt-14">
          {!isOtpSent ? (
            <>
              <p className="self-center font-extralight text-textExtraLight mb-2">
                We will send you a 6-digits verification code
              </p>
              <button
                id="sign-in-button"
                className={`btn-dark w-full mt-14 h-12 rounded-full text-lg ${
                  !isValid || requestCodeProcessing
                    ? "opacity-10"
                    : "opacity-100"
                }`}
                disabled={!hydrated || !isValid || requestCodeProcessing}
                onClick={requestVerificationCode}
              >
                Get Code
              </button>
            </>
          ) : (
            <>
              <button
                className="absolute right-0 -top-11 btn-light ml-3 self-start h-8 px-4 font-light text-textLight text-sm rounded-3xl"
                onClick={resendVerificationCode}
              >
                Resend code
              </button>

              <OtpInput
                value={userOtp}
                valueLen={6}
                onChange={handleOtpChange}
              />

              <Form onSubmit={verifyOtp}>
                <button
                  id="sign-in-button"
                  type="submit"
                  className={`btn-orange w-full mt-14 h-12 rounded-full text-lg ${
                    requestCodeProcessing || verifyOtpProcessing
                      ? "opacity-30"
                      : "opacity-100"
                  }`}
                  disabled={
                    requestCodeProcessing ||
                    !confirmationResult ||
                    !userOtp ||
                    userOtp.length !== 6 ||
                    verifyOtpProcessing
                  }
                >
                  Verify Code
                </button>
              </Form>
              <p className="error font-light text-base">
                {verifyError ? verifyError : <>&nbsp;</>}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
