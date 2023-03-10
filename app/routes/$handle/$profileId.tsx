import { useState, useEffect, useCallback } from "react"
import { json, redirect } from "@remix-run/node"
import {
  useCatch,
  useParams,
  useNavigate,
  useLoaderData,
  useFetcher,
  Link,
  useRevalidator,
} from "@remix-run/react"
import { MdError, MdArrowBackIosNew, MdEdit, MdPerson } from "react-icons/md"
import { toast } from "react-toastify"
import type { LoaderArgs, ActionArgs } from "@remix-run/node"
import type { UserRecord } from "firebase-admin/auth"

import ErrorComponent from "~/components/error"
import { UpdateProfileImageModal } from "~/components/profile/update-image"
import { getMyProfile, getProfile } from "~/graphql/public-apis"
import { follow, getBalance } from "~/graphql/server"
import { checkAuthenticatedAndReady } from "~/server/auth.server"
import { clientAuth } from "~/client/firebase.client"
import type { AccountType, Profile } from "~/types"

/**
 * Query a specific profile by its id
 */
export async function loader({ request, params }: LoaderArgs) {
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

    // Get data from params
    const handle = params.handle
    const profileId = params.profileId

    if (!handle || !profileId) {
      throw new Response("Profile Not Found")
    }

    let address = ""
    let balance = ""
    if (account) {
      address = account.address
      balance = address ? await getBalance(address) : ""
    }

    // Check if the logged in profile and the displayed profile is the same so we can use the right query to fetch the displayed profile detail.
    const isSameProfile = `${loggedInProfile?.id || ""}` === profileId

    // Query the profile
    const profile = isSameProfile
      ? await getMyProfile(Number(profileId), loggedInProfile?.id)
      : await getProfile(Number(profileId), loggedInProfile?.id)

    // Check if the user owns the displayed profile or not
    const isOwner = address.toLowerCase() === profile?.owner?.toLowerCase()

    if (!profile) {
      throw new Response("Profile Not Found")
    }

    return json(
      {
        user,
        profile,
        loggedInProfile,
        balance,
        address,
        accountType: account?.type,
        isSameProfile,
        isOwner,
      },
      { headers }
    )
  } catch (error) {
    throw new Response("Profile Not Found")
  }
}

/**
 * An action to follow a profile
 */
export async function action({ request }: ActionArgs) {
  try {
    // Get the `idToken` from the request
    const form = await request.formData()
    const { idToken, followerId, followeeId } = Object.fromEntries(form) as {
      idToken: string
      followerId: string
      followeeId: string
    }

    const result = await follow({
      idToken,
      followerId: Number(followerId),
      followeeId: Number(followeeId),
    })

    return json(result)
  } catch (error) {
    return json({ status: "Error" })
  }
}

export default function ProfileDetail() {
  const data = useLoaderData<typeof loader>()
  const user = data?.user as UserRecord
  const profile = data?.profile as Profile
  const loggedInProfile = data?.loggedInProfile as Profile
  const accountType = data?.accountType as AccountType
  const isSameProfile = data?.isSameProfile
  const navigate = useNavigate()

  const [updateImageModalVisible, setUpdateImageModalVisible] = useState(false)

  const reauthenticateFetcher = useFetcher()
  const followFetcher = useFetcher<typeof action>()
  const followLoading =
    followFetcher?.state === "submitting" || followFetcher?.state === "loading"
  const followResult = followFetcher?.data
  const revalidator = useRevalidator()

  /**
   * A function to go back to the previous page
   */
  function closeModal() {
    navigate(-1)
  }

  const openImageModal = useCallback(() => {
    setUpdateImageModalVisible(true)
  }, [])

  const closeImageModal = useCallback(() => {
    setUpdateImageModalVisible(false)
    // Revalidate one more time to make sure the data is up to date
    revalidator.revalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When the action function finished
  useEffect(() => {
    if (followResult?.status === "Ok") {
      revalidator.revalidate()
    } else if (followResult?.status === "Error") {
      toast.error("Follow failed, you can try again.", {
        theme: "colored",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followResult])

  // A follow/unFollow function
  async function handleFollow() {
    try {
      if (!loggedInProfile || !profile) return

      const user = clientAuth.currentUser
      const idToken = await user?.getIdToken()
      // For some reason, if no idToken, we need to log user out and have them to sign in again
      if (!idToken) {
        reauthenticateFetcher.submit(null, {
          method: "post",
          action: "/auth/reauthenticate",
        })
        return
      }

      followFetcher.submit(
        {
          followerId: loggedInProfile.id.toString(),
          followeeId: profile.id.toString(),
          idToken,
        },
        { method: "post" }
      )
    } catch (error) {
      toast.error("Something not right, please try again.", {
        theme: "colored",
      })
    }
  }

  /**
   * TODO: Add logic to fetch uploaded videos of the profile
   */

  return (
    <div className="page absolute inset-0">
      <div className="w-full py-[20px] h-[100px] bg-blueBase">
        <div className="absolute left-5 h-[60px] flex items-center cursor-pointer">
          <button className="p-2" disabled={followLoading} onClick={closeModal}>
            <MdArrowBackIosNew size={30} color="white" />
          </button>
        </div>
        <div className="w-[140px] h-[140px] mx-auto bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            {!profile?.imageURI ? (
              <MdPerson size={80} color="#3f3f46" />
            ) : (
              <img
                src={profile.imageURI}
                alt={profile.originalHandle}
                className="w-full h-full object-cover leading-[140px] text-center text-lg text-textDark"
              />
            )}
          </div>
        </div>
      </div>
      <div className="w-full mt-[20px] h-[50px] flex justify-end">
        {/* Allow the user to change their profile image if the displayed and the logged in is the same profile. */}
        <div className="w-1/2 pl-8 flex flex-col justify-end">
          {data?.isOwner && isSameProfile && (
            <button
              className="mx-0 w-max p-4 flex justify-start"
              disabled={!isSameProfile}
              onClick={openImageModal}
            >
              <MdEdit size={30} className="text-orange-500" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-1">
        <h6>{profile?.originalHandle}</h6>
        <h6 className="font-normal text-base text-textDark">
          @{profile?.handle}{" "}
          {/* Display `DEFAULT` if the user is the owner of the profile */}
          {data?.isOwner && data?.profile?.default && (
            <span className="font-light italic text-textExtraLight">
              [DEFAULT]
            </span>
          )}
        </h6>
        <div className="w-full mt-1 flex justify-center items-center gap-x-3">
          {isSameProfile ? (
            <Link to={`/${profile.originalHandle}/followers`}>
              <p className="font-light text-textLight">
                <span className="font-normal text-textDark">
                  {profile?.followersCount}
                </span>{" "}
                followers
              </p>
            </Link>
          ) : (
            <p className="font-light text-textLight">
              <span className="font-normal text-textDark">
                {followLoading
                  ? profile?.isFollowing
                    ? profile?.followersCount - 1
                    : profile?.followersCount + 1
                  : profile?.followersCount}
              </span>{" "}
              followers
            </p>
          )}
          {/* Show following if logged in and displayed profile is the same profile */}
          {isSameProfile && (
            <Link to={`/${profile?.originalHandle}/following`}>
              <p className="font-light text-textLight">
                <span className="font-normal text-textDark">
                  {profile.followingCount}
                </span>{" "}
                following
              </p>
            </Link>
          )}
          <p className="font-light text-textLight">
            <span className="font-normal text-textDark">
              {profile?.publishesCount}
            </span>{" "}
            videos
          </p>
        </div>
        {/* Add the ability to follow/unfollow if the logged in and displayed is NOT the same profile. */}
        {!isSameProfile && (
          <div className="w-full my-2 relative">
            <followFetcher.Form onSubmit={handleFollow}>
              {!profile?.isFollowing ? (
                <ActionButton
                  type="submit"
                  isError={followLoading ? true : false}
                  disabled={!profile || !loggedInProfile || followLoading}
                >
                  {followLoading ? "UnFollow" : "Follow"}
                </ActionButton>
              ) : (
                <ActionButton
                  type="submit"
                  isError={followLoading ? false : true}
                  disabled={!profile || !loggedInProfile || followLoading}
                >
                  {followLoading ? "Follow" : "UnFollow"}
                </ActionButton>
              )}
            </followFetcher.Form>
          </div>
        )}
      </div>
      {/* TODO: Display Videos */}
      <div className="mt-2">Videos</div>

      {updateImageModalVisible && (
        <UpdateProfileImageModal
          userId={user?.uid}
          accountType={accountType}
          handle={profile?.handle}
          tokenId={profile?.tokenId}
          oldImageURI={profile?.imageURI}
          closeModal={closeImageModal}
        />
      )}
    </div>
  )
}

/**
 * Custom button
 */
function ActionButton({
  type,
  children,
  disabled,
  onClick,
  isError = false,
}: {
  type: "button" | "reset" | "submit" | undefined
  children: React.ReactNode
  disabled: boolean
  onClick?: () => void
  isError?: boolean
}) {
  return (
    <button
      type={type}
      className={`${
        isError ? "btn-light text-error" : "btn-dark"
      } w-4/5 h-12 rounded-full text-lg ${
        disabled ? "opacity-50" : "opacity-100"
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  const params = useParams()
  const navigate = useNavigate()

  function closeModal() {
    navigate(-1)
  }

  return (
    <ErrorComponent error={caught.statusText}>
      <div className="page absolute inset-0">
        <div className="w-full py-[20px] h-[100px] bg-blueBase">
          <div className="absolute left-5 h-[60px] flex items-center cursor-pointer">
            <MdArrowBackIosNew size={30} color="white" onClick={closeModal} />
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
  const navigate = useNavigate()

  function closeModal() {
    navigate(-1)
  }

  return (
    <ErrorComponent error={error.message}>
      <div className="page absolute inset-0">
        <div className="w-full py-[20px] h-[100px] bg-blueBase">
          <div className="absolute left-5 h-[60px] flex items-center cursor-pointer">
            <MdArrowBackIosNew size={30} color="white" onClick={closeModal} />
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
          <h6 className="cusor-pointer" onClick={closeModal}>
            Close
          </h6>
        </div>
      </div>
    </ErrorComponent>
  )
}
