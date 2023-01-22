import React from "react"
import { Form } from "@remix-run/react"
import PhoneInput, {
  getCountryCallingCode,
  isValidPhoneNumber,
} from "react-phone-number-input/input"
import _ from "lodash"
import { IoCaretDownOutline } from "react-icons/io5"
import type { Country } from "react-phone-number-input"
import OtpInput from "./opt-input"
import { getCountryNames } from "~/utils"

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
  const [country, setCountry] = React.useState<Country | undefined>()
  const [phoneNumber, setPhoneNumber] = React.useState<string>()
  const [isValid, setIsValid] = React.useState(false)
  const [otp, setOtp] = React.useState("")
  const [otpSent, setOptSent] = React.useState(false)

  React.useEffect(() => {
    if (defaultCountry) {
      setCountry(defaultCountry)
    }
  }, [defaultCountry])

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCountry(e.target.value as Country)
  }

  const validatePhoneNumberDebounce = React.useMemo(
    () => _.debounce(validatePhoneNumber, 500),
    []
  )

  React.useEffect(() => {
    if (phoneNumber && country) {
      validatePhoneNumberDebounce(phoneNumber, country)
    }
  }, [phoneNumber, country, validatePhoneNumberDebounce])

  function validatePhoneNumber(phoneNumber: string, country: Country) {
    const valid = isValidPhoneNumber(phoneNumber, country)
    setIsValid(valid)
  }

  function handleOtpChange(value: string) {
    setOtp(value)
  }

  return (
    <div className="px-5">
      <Form>
        <div className="border border-borderLightGray rounded-lg">
          <div className="relative px-4 h-10 border-b border-borderLightGray flex items-center">
            <select
              value={country}
              onChange={handleChange}
              className="w-full bg-transparent text-lg appearance-none focus:outline-none"
            >
              <Option value="" name="International" />
              {getCountryNames().map((c) => (
                <Option key={c.code} value={c.code as Country} name={c.name} />
              ))}
            </select>
            <IoCaretDownOutline
              color="#525252"
              className="absolute -z-10 right-4"
            />
          </div>
          <div className="h-12 px-2 flex items-center">
            <div className="h-full w-20 border-r border-borderLight flex justify-center items-center">
              <p className="text-lg text-textRegular">
                {country && `+${getCountryCallingCode(country)}`}
              </p>
            </div>
            <div className="h-full flex-grow">
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
        </div>

        <div className="mt-10">
          {!otpSent ? (
            <p className="self-center font-extralight text-textExtraLight mb-2">
              We will send you 6-digits verification code
            </p>
          ) : (
            <OtpInput value={otp} valueLen={6} onChange={handleOtpChange} />
          )}
        </div>

        <button
          type="submit"
          className={`btn-dark w-full mt-10 h-12 rounded-full text-lg ${
            !isValid ? "opacity-10" : "opacity-100"
          }`}
          disabled={!hydrated || !isValid}
        >
          Get Code
        </button>
      </Form>
    </div>
  )
}
