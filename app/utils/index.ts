import { getCountries } from "react-phone-number-input/input"
import en from "react-phone-number-input/locale/en.json"

import { UPLOAD_SERVICE_URL } from "~/constants"

export function getCountryNames() {
  return getCountries()
    .map((c) => ({ code: c, name: en[c] }))
    .sort((c1, c2) => {
      const c1Name = c1.name.toLowerCase()
      const c2Name = c2.name.toLowerCase()

      return c1Name > c2Name ? 1 : c1Name < c2Name ? -1 : 0
    })
}

export function getPageTitle(pathname: string) {
  let title: string = ""

  if (pathname === "/content") {
    title = "Dashboard"
  }
  if (pathname === "/wallet") {
    title = "Wallet"
  }
  if (pathname === "/settings") {
    title = "Settings"
  }

  return title
}

export async function uploadImage({
  uid,
  file,
  handle,
  oldImageURI,
}: {
  uid: string
  file: File
  handle: string
  oldImageURI: string | null
}) {
  const formData = new FormData()
  formData.append("uid", uid)
  formData.append("file", file!)
  formData.append("handle", handle)
  if (oldImageURI) {
    formData.append("oldURI", oldImageURI)
  }

  // const res = await fetch(`${UPLOAD_SERVICE_URL}/profile/avatar`, {
  const res = await fetch(`http://localhost:4444/profile/avatar`, {
    method: "POST",
    body: formData,
  })

  const data = (await res.json()) as { url: string }
  return data.url
}

/**
 * A helper functionto wait
 * @param time
 */
export function wait(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}
