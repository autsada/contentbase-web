import { getCountries } from "react-phone-number-input/input"
import en from "react-phone-number-input/locale/en.json"

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
    const routeNames = pathname.split("/")
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
  }

  return title
}
