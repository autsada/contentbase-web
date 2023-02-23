import { json, redirect } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Outlet, useCatch, useLoaderData } from "@remix-run/react"

import ErrorComponent from "~/components/error"
import FirstprofileNotification from "~/components/firstprofile-notification"
import { checkAuthenticatedAndReady } from "~/server/auth.server"
import { useFirstProfile } from "~/hooks/useFirstProfile"

export async function loader({ request }: LoaderArgs) {
  try {
    const { user, account, loggedInProfile, headers } =
      await checkAuthenticatedAndReady(request)

    // Push user to auth page if they are not logged in
    if (!user) {
      return redirect("/auth", { headers })
    }

    // Reaauthenticate user if they still doesn't have an account
    if (!account) {
      return redirect("/auth/reauthenticate", { headers })
    }

    return json({ user, account, loggedInProfile }, { headers })
  } catch (error) {
    throw new Response("Something not right")
  }
}

export default function Upload() {
  const data = useLoaderData<typeof loader>()
  const isNoProfile = !data?.loggedInProfile

  const { modalVisible, onIntentToCreateProfile, onNotToCreateProfile } =
    useFirstProfile(isNoProfile, false)

  return (
    <>
      <Outlet />

      <FirstprofileNotification
        title="You need a first profile to upload"
        modalVisible={modalVisible}
        onOk={onIntentToCreateProfile}
        onCancel={onNotToCreateProfile}
      />
    </>
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
