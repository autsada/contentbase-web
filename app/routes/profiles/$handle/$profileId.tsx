import { json } from "@remix-run/node"
import {
  Link,
  useCatch,
  useParams,
  useNavigate,
  useLoaderData,
} from "@remix-run/react"
import { MdError, MdArrowBackIosNew } from "react-icons/md"
import type { LoaderArgs, ActionArgs } from "@remix-run/node"

import ErrorComponent from "~/components/error"
import { ProfileDetail } from "~/components/profiles/profile-detail"
import { getProfile } from "~/graphql/public-apis"
import { useProfileContext } from "~/routes/profiles"
import { updateProfileImage } from "~/graphql/server"
import type { Profile } from "~/types"

/**
 * Query a specific profile by its id
 */
export async function loader({ request, params }: LoaderArgs) {
  try {
    const handle = params.handle
    const profileId = params.profileId

    if (!handle || !profileId) {
      throw new Response("Profile Not Found")
    }

    // Query the profile
    const profile = await getProfile(Number(profileId))

    if (!profile) {
      throw new Response("Profile Not Found")
    }

    return json({ profile })
  } catch (error) {
    throw new Response("Profile Not Found")
  }
}
export type LoadProfileLoader = typeof loader

/**
 * An action to update profile image
 */
export async function action({ request }: ActionArgs) {
  try {
    const form = await request.formData()
    const { tokenId, imageURI, idToken } = Object.fromEntries(form) as {
      tokenId: string
      imageURI: string
      idToken: string
    }

    await updateProfileImage({
      idToken,
      imageURI,
      tokenId: Number(tokenId),
    })

    return json({ status: "Ok" })
  } catch (error) {
    return json({ status: "Error" })
  }
}
export type UpdateProfileImageAction = typeof action

export default function MyProfile() {
  const context = useProfileContext()
  const data = useLoaderData<typeof loader>()

  const navigate = useNavigate()

  function closeModal() {
    navigate("/profiles")
  }

  return (
    <div className="page">
      <ProfileDetail
        context={context}
        profile={data?.profile as Profile}
        closeModal={closeModal}
      />
    </div>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  const params = useParams()

  return (
    <ErrorComponent error={caught.statusText}>
      <div className="page absolute inset-0">
        <div className="w-full py-[20px] h-[100px] bg-blueBase">
          <div className="absolute left-5 h-[60px] flex items-center">
            <Link to="/profiles">
              <MdArrowBackIosNew size={30} color="white" />
            </Link>
          </div>
          <div className="w-max mx-auto rounded-full px-0 bg-white overflow-hidden">
            <MdError size={140} className="error" />
          </div>
        </div>
        <div className="pt-[80px] text-center">
          <h3 className="text-error">Error Occurred</h3>
          <p className="mt-5 text-lg">
            The Profile{" "}
            <span className="text-blueBase">
              {params.handle}#{params.profileId}
            </span>{" "}
            Not Found
          </p>
        </div>
      </div>
    </ErrorComponent>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  const params = useParams()

  return (
    <ErrorComponent error={error.message}>
      <div className="page absolute inset-0">
        <div className="w-full py-[20px] h-[100px] bg-blueBase">
          <div className="absolute left-5 h-[60px] flex items-center">
            <Link to="/profiles">
              <MdArrowBackIosNew size={30} color="white" />
            </Link>
          </div>
          <div className="w-max mx-auto rounded-full px-0 bg-white overflow-hidden">
            <MdError size={140} className="error" />
          </div>
        </div>
        <div className="pt-[80px] text-center px-5">
          <h3 className="text-error">Error Occurred</h3>
          <p className="mt-5 text-lg">
            There was an error loading{" "}
            <span className="text-blueBase">{params.handle}</span> Profile.
            Please try again.
          </p>
        </div>

        <div className="mt-5">
          <Link to="/profiles">
            <h6 className="cusor-pointer">Close</h6>
          </Link>
        </div>
      </div>
    </ErrorComponent>
  )
}
