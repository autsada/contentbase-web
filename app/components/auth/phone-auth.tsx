import React from "react"
import { Form } from "@remix-run/react"
import PhoneInput, {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
} from "react-phone-number-input/input"
import _ from "lodash"
import en from "react-phone-number-input/locale/en.json"
import type { Country } from "react-phone-number-input"

interface Props {
  country?: Country | null
  hydrated: boolean
}

function Option({ value }: { value: Country | "" }) {
  if (!value)
    return (
      <option value={value} className="font-normal text-textRegular text-base">
        {en.ZZ}
      </option>
    )
  return (
    <option value={value} className="font-normal text-textRegular text-base">
      {en[value]}
    </option>
  )
}

export function PhoneAuth({ country: defaultCountry, hydrated }: Props) {
  const [country, setCountry] = React.useState<Country | undefined>()
  const [phoneNumber, setPhoneNumber] = React.useState<string>()
  const [isValid, setIsValid] = React.useState(false)

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

  return (
    <div className="px-5">
      <Form>
        <div className="border border-borderLightGray rounded-lg">
          <div className="px-4 h-10 border-b border-borderLightGray flex items-center">
            <select
              value={country}
              onChange={handleChange}
              className="w-full bg-transparent text-lg focus:outline-none"
            >
              <Option value="" />
              {getCountries().map((c) => (
                <Option key={c} value={c} />
              ))}
            </select>
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
                placeholder="Phone number"
                className="w-full h-full leading-12 p-0 pl-4 appearance-none font-normal text-textRegular text-lg placeholder:font-light placeholder:text-textExtraLight focus:outline-none"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className={`btn-dark w-full mt-10 h-12 rounded-full text-xl ${
            !isValid ? "opacity-10" : "opacity-100"
          }`}
          disabled={!hydrated || !isValid}
        >
          Continue
        </button>
      </Form>
    </div>
  )
}
