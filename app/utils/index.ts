import { getCountries } from "react-phone-number-input/input"
import en from "react-phone-number-input/locale/en.json"

import { UPLOAD_SERVICE_URL } from "~/constants"
import type { UploadType } from "~/types"

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

  // if (pathname.startsWith("/auth")) {
  //   const routeNames = pathname.split("/")
  //   const name = routeNames[routeNames.length - 1]
  //   if (name === "auth") {
  //     title = "Connect"
  //   }
  //   if (name === "phone") {
  //     title = "Log in with Phone"
  //   }
  //   if (name === "email") {
  //     title = "Log in with Email"
  //   }
  //   if (name === "wallet") {
  //     title = "Log in with Wallet"
  //   }
  // }

  if (pathname.startsWith("/profiles")) {
    const routeNames = pathname.split("/").filter((name) => !!name)
    const name = routeNames[routeNames.length - 1]
    if (name === "profiles") {
      title = "Your Profiles"
    }
    if (name === "create") {
      title = "Create Profile"
    }
    if (name === "wallet") {
      title = "Wallet"
    }
    if (name === "followers" || name === "following") {
      title = routeNames[routeNames.length - 2]
    }
  }

  return title
}

export async function uploadImage({
  uid,
  file,
  handle,
  uploadType,
  oldImageURI,
}: {
  uid: string
  file: File
  handle: string
  uploadType: UploadType
  oldImageURI: string | null
}) {
  const formData = new FormData()
  formData.append("uid", uid)
  formData.append("file", file!)
  formData.append("handle", handle)
  formData.append("uploadType", uploadType)
  if (oldImageURI) {
    formData.append("oldURI", oldImageURI)
  }

  const res = await fetch(`${UPLOAD_SERVICE_URL}/profile/avatar`, {
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
