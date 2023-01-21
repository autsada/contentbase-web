import React from "react"
import type { LoaderArgs, ActionArgs, Session } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  ClientOnly,
  useAuthenticityToken,
  verifyAuthenticityToken,
  useHydrated,
} from "remix-utils"
import { useFetcher } from "@remix-run/react"
import type { Country } from "react-phone-number-input"

import { PhoneAuth } from "~/components/auth/phone-auth"
import {
  commitSession,
  getSession,
  destroySession,
} from "~/server/session.server"

// We need Javascript client side to run the component
export const handle = { hydrate: true }

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request.headers.get("cookie"))
  // const { uid } = await checkSessionCookie(session)
  const headers = {
    "Set-Cookie": await commitSession(session),
  }

  return json({ status: "Ok" }, { headers })

  // if (uid) {
  //   return redirect("/", { headers })
  // }
  // return json(null, { headers })
}

export async function action({ request }: ActionArgs) {
  let session: Session | undefined = undefined

  try {
    session = await getSession(request.headers.get("cookie"))
    if (session) {
      await verifyAuthenticityToken(request, session)
      const form = await request.formData()
      const { lat, lng } = Object.fromEntries(form) as {
        lat: string
        lng: string
      }

      const geoCodeURL = process.env.GEOCODE_URL
      const mapApiKey = process.env.GOOGLE_MAPS_API_KEY
      const data = await (
        await fetch(`${geoCodeURL!}/json?latlng=${lat},${lng}&key=${mapApiKey}`)
      ).json()

      const [locationData] = data.results.filter(
        ({ types }: { types: string }) => types.includes("country")
      )
      const [country] = locationData?.address_components
      const countryShort = country?.short_name as Country

      return json({ country: countryShort })
    } else {
      return json({ country: null })
    }
  } catch (error) {
    // Delete user from Firebase auth
    if (session) {
      // Delete cookie
      await destroySession(session)
    }

    return json({ country: null })
  }
}

export default function Phone() {
  const fetcher = useFetcher<typeof action>()
  const country = fetcher?.data?.country
  const csrf = useAuthenticityToken()
  const hydrated = useHydrated()

  React.useEffect(() => {
    let render = true

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        if (typeof latitude === "number" && typeof longitude === "number") {
          if (render)
            fetcher.submit(
              { lat: `${latitude}`, lng: `${longitude}`, csrf },
              { method: "post" }
            )
        }
      },
      (error) => {
        console.warn(error.message)
      }
    )

    return () => {
      render = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ClientOnly>
      {() => (
        <div className="p-5 text-center">
          <h6 className="text-xl mb-5">Connect with Phone Number</h6>
          <PhoneAuth country={country} hydrated={hydrated} />
        </div>
      )}
    </ClientOnly>
  )
}
