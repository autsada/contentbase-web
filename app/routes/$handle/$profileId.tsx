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

import ErrorComponent from "~/components/error"
import { UpdateProfileImageModal } from "~/components/profile/update-image"
import { Spinner } from "~/components/spinner"
import {
  getMyProfile,
  getProfile,
  queryAccountByUid,
} from "~/graphql/public-apis"
import { getBalance, updateProfileImage } from "~/graphql/server"
import { requireAuth } from "~/server/auth.server"
import { clientAuth } from "~/client/firebase.client"
import { useFollowProfile } from "~/hooks/follow-contract"
import type { AccountType, Profile } from "~/types"
import type { EstimateGasUpdateProfileImageAction } from "../contracts/profile/update-image"
import type { FollowAction } from "../contracts/follow"
import { wait } from "~/utils"

/**
 * Query a specific profile by its id
 */
export async function loader({ request, params }: LoaderArgs) {
  try {
    const { user, headers } = await requireAuth(request)

    if (!user) {
      return redirect("/auth", { headers })
    }

    // Get data from params
    const handle = params.handle
    const profileId = params.profileId

    if (!handle || !profileId) {
      throw new Response("Profile Not Found")
    }

    // Get user' account and the current logged in profile
    const account = user ? await queryAccountByUid(user.uid) : null
    const loggedInProfile = account?.profile

    if (!loggedInProfile) {
      return redirect("/auth/reauthenticate", { headers })
    }

    let address = ""
    let balance = ""
    if (account) {
      address = account.address
      balance = address ? await getBalance(address) : ""
    }

    // Check if the logged in profile and the displayed profile is the same so we can use the right query to fetch the displayed profile detail.
    const isSameProfile = `${loggedInProfile.id || ""}` === profileId

    // Query the profile
    const profile = isSameProfile
      ? await getMyProfile(Number(profileId), loggedInProfile.id)
      : await getProfile(Number(profileId), loggedInProfile.id)

    // Check if the user owns the displayed profile or not
    const isOwner = address.toLowerCase() === profile?.owner?.toLowerCase()

    if (!profile) {
      throw new Response("Profile Not Found")
    }

    return json({
      profile,
      loggedInProfile,
      balance,
      address,
      accountType: account?.type,
      isSameProfile,
      isOwner,
    })
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

export default function ProfileDetail() {
  const data = useLoaderData<typeof loader>()
  const profile = data?.profile as Profile
  const loggedInProfile = data?.loggedInProfile as Profile
  const accountType = data?.accountType as AccountType
  const isSameProfile = data?.isSameProfile
  const navigate = useNavigate()

  function closeModal() {
    navigate(-1)
  }

  const [updateImageModalVisible, setUpdateImageModalVisible] = useState(false)
  // Use this state to display spinner for `WALLET` account
  const [walletFollowLoading, setWalletFollowLoading] = useState<boolean>()

  const estimateGasFetcher = useFetcher<EstimateGasUpdateProfileImageAction>()
  const reauthenticateFetcher = useFetcher()
  const followFetcher = useFetcher<FollowAction>()
  const traditionalFollowLoading =
    followFetcher?.state === "submitting" || followFetcher?.state === "loading"
  const revalidator = useRevalidator()
  const {
    write,
    isPrepareLoading,
    isWriteLoading,
    writeError,
    isWaitLoading,
    waitError,
    isWaitSuccess,
  } = useFollowProfile(
    Number(loggedInProfile?.tokenId),
    Number(profile?.tokenId),
    accountType
  )

  /**
   * On first render when the profile is available and the logged in profile and the displayed profile are the same, check gas fee for updating an image.
   */
  useEffect(() => {
    if (isSameProfile && profile?.tokenId) {
      if (accountType === "TRADITIONAL") {
        // Call the server
        const getEstimatedGas = async () => {
          const user = clientAuth.currentUser
          const idToken = await user?.getIdToken()
          if (!idToken) return
          estimateGasFetcher.submit(
            { idToken, tokenId: profile.tokenId },
            {
              method: "post",
              action: `/contracts/profile/update-image`,
            }
          )
        }

        getEstimatedGas()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountType, isSameProfile, profile?.tokenId])

  const openImageModal = useCallback(() => {
    setUpdateImageModalVisible(true)
  }, [])

  const closeImageModal = useCallback(() => {
    setUpdateImageModalVisible(false)
    // Revalidate one more time to make sure the data is up to date
    revalidator.revalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * TODO: Add logic to follow and unFollow
   */

  // `TRADITIONAL` Account: follow logic
  async function handleFollowTraditional() {
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
          followerId: loggedInProfile.tokenId,
          followeeId: profile.tokenId,
          idToken,
        },
        { method: "post", action: "/contracts/follow" }
      )
    } catch (error) {
      toast.error("Something not right, please try again.", {
        theme: "colored",
      })
    }
  }

  // `WALLET` Account: the follow logic
  async function handleFollowWallet() {
    if (!write) return
    setWalletFollowLoading(true)
    write()
  }

  // `WALLET` Account: when transaction done.
  useEffect(() => {
    let mounted = true
    if (isWaitSuccess) {
      revalidator.revalidate()
      // Wait for states to be updated before turn off the spinner
      wait(600).then(() => {
        if (mounted) {
          setWalletFollowLoading(false)
        }
      })
    }

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWaitSuccess])

  // `WALLET` Account: when transaction error.
  useEffect(() => {
    if (writeError?.message || waitError?.message) {
      setWalletFollowLoading(false)
      toast.error(
        writeError?.message ||
          waitError?.message ||
          "Something not right, please try again.",
        {
          theme: "colored",
        }
      )
    }
  }, [writeError?.message, waitError?.message])

  /**
   * TODO: Add logic to fetch uploaded videos of the profile
   */

  return (
    <div className="page absolute inset-0">
      <div className="w-full py-[20px] h-[100px] bg-blueBase">
        <div className="absolute left-5 h-[60px] flex items-center cursor-pointer">
          <MdArrowBackIosNew size={30} color="white" onClick={closeModal} />
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
      <div className="mt-4">
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
                {profile?.followersCount}
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
            {accountType === "TRADITIONAL" ? (
              <followFetcher.Form onSubmit={handleFollowTraditional}>
                {!profile?.isFollowing ? (
                  <button
                    type="submit"
                    className="btn-dark w-4/5 rounded-full"
                    disabled={
                      accountType !== "TRADITIONAL" ||
                      !profile ||
                      !loggedInProfile ||
                      isSameProfile ||
                      traditionalFollowLoading
                    }
                  >
                    Follow
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn-light w-4/5 rounded-full text-error"
                    disabled={
                      accountType !== "TRADITIONAL" ||
                      !profile ||
                      !loggedInProfile ||
                      isSameProfile ||
                      traditionalFollowLoading
                    }
                  >
                    UnFollow
                  </button>
                )}
              </followFetcher.Form>
            ) : accountType === "WALLET" ? (
              <>
                {!profile?.isFollowing ? (
                  <button
                    className="btn-dark w-4/5 rounded-full"
                    disabled={
                      accountType !== "WALLET" ||
                      !profile ||
                      !loggedInProfile ||
                      isSameProfile ||
                      isPrepareLoading ||
                      !write ||
                      isWriteLoading ||
                      isWaitLoading ||
                      walletFollowLoading
                    }
                    onClick={handleFollowWallet}
                  >
                    Follow
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn-light w-4/5 rounded-full text-error"
                    disabled={
                      accountType !== "WALLET" ||
                      !profile ||
                      !loggedInProfile ||
                      isSameProfile ||
                      isPrepareLoading ||
                      !write ||
                      isWriteLoading ||
                      isWaitLoading ||
                      walletFollowLoading
                    }
                    onClick={handleFollowWallet}
                  >
                    UnFollow
                  </button>
                )}
              </>
            ) : null}

            {/* `TRADITIONAL` Account spinner */}
            {accountType === "TRADITIONAL" && traditionalFollowLoading && (
              <div
                className={`absolute inset-0 flex items-center justify-center bg-white opacity-60`}
              >
                <Spinner
                  size={{ w: "w-5", h: "h-5" }}
                  color={profile?.isFollowing ? "orange" : "default"}
                />
              </div>
            )}

            {/* `WALLET` Account spinner */}
            {accountType === "WALLET" && walletFollowLoading && (
              <div
                className={`absolute inset-0 flex items-center justify-center bg-white opacity-60`}
              >
                <Spinner
                  size={{ w: "w-5", h: "h-5" }}
                  color={profile?.isFollowing ? "orange" : "default"}
                />
              </div>
            )}
          </div>
        )}
      </div>
      {/* TODO: Display Videos */}
      <div className="mt-2">Videos</div>

      {updateImageModalVisible && (
        <UpdateProfileImageModal
          accountType={accountType}
          gas={estimateGasFetcher?.data?.gas}
          handle={profile?.handle}
          tokenId={profile?.tokenId}
          oldImageURI={profile?.imageURI}
          balance={data?.balance}
          closeModal={closeImageModal}
        />
      )}
    </div>
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
