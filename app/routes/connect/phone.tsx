import React from "react"
import { redirect } from "@remix-run/node"
import type { LoaderArgs, ActionArgs, Session } from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  ClientOnly,
  useAuthenticityToken,
  verifyAuthenticityToken,
  useHydrated,
} from "remix-utils"
import { useCatch, useFetcher } from "@remix-run/react"
import type { Country } from "react-phone-number-input"

import { PhoneAuth } from "~/components/auth/phone-auth"
import {
  commitSession,
  getSession,
  destroySession,
} from "~/server/session.server"
import { checkSessionCookie } from "~/server/auth.server"
import ErrorComponent from "~/components/error"

// We need Javascript client side to run the component
export const handle = { hydrate: true }

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request.headers.get("cookie"))
  const decodedIdToken = await checkSessionCookie(session)
  const headers = {
    "Set-Cookie": await commitSession(session),
  }

  if (decodedIdToken && decodedIdToken.uid) {
    return redirect("/", { headers })
  }
  return json(null, { headers })
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

    // Get user current location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        if (typeof latitude === "number" && typeof longitude === "number") {
          if (render)
            // Send current lat,lng to the server to get country.
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
    <div className="page py-10">
      <h6 className="text-2xl mb-10">Connect with Phone Number</h6>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <PhoneAuth country={country} hydrated={hydrated} />}
      </ClientOnly>
    </div>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  return <ErrorComponent error={caught.statusText} />
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <ErrorComponent error={error.message} />
}
