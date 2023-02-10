import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useFetcher } from "@remix-run/react"
import { MdArrowBackIosNew, MdPerson, MdOutlineEdit } from "react-icons/md"

import { UpdateProfileImageModal } from "./update-image"
import { clientAuth } from "~/client/firebase.client"
import type { Profile } from "~/types"
import type { ProfileContext } from "~/routes/profiles"
import type { EstimateGasUpdateProfileImageAction } from "~/routes/gas/profile/update-image"

interface Props {
  context: ProfileContext
  profile: Profile
  closeModal: () => void
}

export function ProfileDetail({ context, profile, closeModal }: Props) {
  // Check whether the account owns the profile or not
  const isOwner = useMemo(
    () => context?.account?.address === profile?.owner,
    [context?.account?.address, profile?.owner]
  )
  // The current profile that the user uses
  const loggedInProfile = useMemo(
    () => context?.loggedInProfile,
    [context?.loggedInProfile]
  )
  // Check whehter the logged in profile and the displayed profile is the same or not.
  const isSameProfile = useMemo(
    () => profile?.id === loggedInProfile?.id,
    [profile?.id, loggedInProfile?.id]
  )
  const accountType = useMemo(
    () => context?.account?.type,
    [context?.account?.type]
  )

  const estimateGasFetcher = useFetcher<EstimateGasUpdateProfileImageAction>()

  const [updateImageModalVisible, setUpdateImageModalVisible] = useState(false)

  /**
   * On first render when the profile is available and the logged in profile and the displayed profile are the same, call the server to get estimated gas used to update an image.
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
              action: `/gas/profile/update-image`,
            }
          )
        }

        getEstimatedGas()
      }

      if (accountType === "WALLET") {
        // Connect to the blockchain directly
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountType, isSameProfile, profile?.tokenId])

  const openImageModal = useCallback(() => {
    setUpdateImageModalVisible(true)
  }, [])

  const closeImageModal = useCallback(() => {
    setUpdateImageModalVisible(false)
  }, [])

  /**
   * TODO: Add logic to fetch uploaded videos of the profile
   */
  return (
    <div className="page absolute inset-0">
      <div className="w-full py-[20px] h-[100px] bg-blueBase">
        <div className="absolute left-5 h-[60px] flex items-center">
          <MdArrowBackIosNew size={30} color="white" onClick={closeModal} />
        </div>
        <div className="w-[140px] h-[140px] mx-auto bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            {!profile.imageURI ? (
              <MdPerson size={80} color="#3f3f46" />
            ) : (
              <img
                src={profile.imageURI}
                alt={profile.originalHandle}
                className="w-full h-full object-fill"
              />
            )}
          </div>
        </div>
      </div>
      <div className="w-full mt-[20px] h-[40px] flex justify-end">
        {/* Allow the user to change their profile image if the displayed and the logged in is the same profile. */}
        <div className="w-1/2 pl-8">
          {isSameProfile && (
            <button
              className="mx-0 w-max p-4 flex justify-start"
              disabled={!isSameProfile}
              onClick={openImageModal}
            >
              <MdOutlineEdit size={30} />
            </button>
          )}
        </div>
      </div>
      <div className="mt-1">
        <h6>{profile.originalHandle}</h6>
        <h6 className="font-normal text-base text-textDark">
          @{profile.handle}{" "}
          {/* Display `DEFAULT` if the user is the owner of the profile */}
          {isOwner && profile.default && (
            <span className="font-thin italic text-textExtraLight">
              [DEFAULT]
            </span>
          )}
        </h6>
        <div className="w-full mt-1 flex justify-center items-center gap-x-3">
          {isSameProfile ? (
            <Link to={`/profiles/${profile.originalHandle}/followers`}>
              <p className="font-light text-textLight">
                {profile.followersCount} followers
              </p>
            </Link>
          ) : (
            <p className="font-light text-textLight">
              {profile.followersCount} followers
            </p>
          )}
          {/* Show following if logged in and displayed profile is the same profile */}
          {isSameProfile && (
            <Link to={`/profiles/${profile.originalHandle}/following`}>
              <p className="font-light text-textLight">
                {profile.followingCount} following
              </p>
            </Link>
          )}
          <p className="font-light text-textLight">
            {profile.publishesCount} videos
          </p>
        </div>
        {/* Add the ability to follow/unfollow if the logged in and displayed is NOT the same profile. */}
        {!isSameProfile && (
          <div className="w-full my-2">
            {!profile?.isFollowing ? (
              <button className="btn-dark w-3/5 rounded-full">Follow</button>
            ) : (
              <button className="btn-light w-3/5 rounded-full text-error">
                Unfollow
              </button>
            )}
          </div>
        )}
      </div>
      {/* TODO: Display Videos */}
      <div>Videos</div>

      {updateImageModalVisible && (
        <UpdateProfileImageModal
          accountType={accountType}
          gas={estimateGasFetcher?.data?.gas}
          handle={profile?.handle}
          tokenId={profile?.tokenId}
          oldImageURI={profile?.imageURI}
          balance={context?.balance}
          closeModal={closeImageModal}
        />
      )}
    </div>
  )
}
