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

/**
 * A helper functionto wait
 * @param time
 */
export function wait(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}
