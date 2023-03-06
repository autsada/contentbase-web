import { getCountries } from "react-phone-number-input/input"
import en from "react-phone-number-input/locale/en.json"
import _ from "lodash"

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

  if (pathname.startsWith("/dashboard")) {
    switch (pathname) {
      case "/dashboard/videos":
        title = "Dashboard: Videos"
        break

      case "/dashboard/blogs":
        title = "Dashboard: Blogs"
        break

      default:
        title = "Dashboard"
        break
    }
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

// Create excerpt from long string
export function getTextExcerpt(text: string, len = 100) {
  return _.truncate(text, { length: len, separator: /,?\.* +/ }) // separate by spaces, including preceding commas and periods
}
