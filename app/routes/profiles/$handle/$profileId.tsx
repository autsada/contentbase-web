import { json } from "@remix-run/node"
import { Link, useCatch, useLoaderData, useParams } from "@remix-run/react"
import { MdPerson, MdError, MdArrowBackIosNew } from "react-icons/md"
import type { LoaderArgs } from "@remix-run/node"

import ErrorComponent from "~/components/error"
import { getMyProfile } from "~/graphql/public-apis"

export async function loader({ request, params }: LoaderArgs) {
  try {
    const handle = params.handle
    const profileId = params.profileId

    if (!handle || !profileId) {
      throw new Response("Profile Not Found")
    }

    // Query the profile
    const profile = await getMyProfile(Number(profileId))

    if (!profile) {
      throw new Response("Profile Not Found")
    }

    return json({ profile })
  } catch (error) {
    throw new Response("Profile Not Found")
  }
}

export default function MyProfile() {
  const data = useLoaderData<typeof loader>()
  const profile = data?.profile

  return (
    <div className="page absolute inset-0">
      <div className="w-full py-[20px] h-[100px] bg-blueBase">
        <div className="absolute left-5 h-[60px] flex items-center">
          <Link to="/profiles">
            <MdArrowBackIosNew size={30} color="white" />
          </Link>
        </div>
        <div className="w-[140px] h-[140px] mx-auto bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden">
          {!profile.imageURI ? (
            <MdPerson size={80} color="#3f3f46" />
          ) : (
            <img
              src={profile.imageURI}
              alt={profile.originalHandle}
              className="object-cover"
            />
          )}
        </div>
      </div>
      <div className="mt-[70px]">
        <h6>{profile.originalHandle}</h6>
        <h6 className="font-normal text-base text-textDark">
          @{profile.handle}{" "}
          {profile.default && (
            <span className="font-thin italic text-textExtraLight">
              [DEFAULT]
            </span>
          )}
        </h6>
        <div className="w-full mt-1 flex justify-center items-center gap-x-3">
          <p className="font-light text-textLight">
            {profile.followersCount} Followers
          </p>
          <p className="font-light text-textLight">
            {profile.followingCount} Following
          </p>
          <p className="font-light text-textLight">
            {profile.publishesCount} Videos
          </p>
        </div>
      </div>
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
        <div className="pt-[80px] text-center">
          <h3 className="text-error">Error Occurred</h3>
          <p className="mt-5 text-lg">
            There was an error loading the Profile
            <span className="text-blueBase">
              {params.handle}#{params.profileId}
            </span>
            . Please try again.
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
