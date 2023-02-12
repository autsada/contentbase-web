import { useCallback, useEffect, useState } from "react"
import { Link, useFetcher, useLoaderData } from "@remix-run/react"
import { MdArrowBackIosNew, MdPerson, MdEdit } from "react-icons/md"
import { useAccount } from "wagmi"

import { UpdateProfileImageModal } from "./update-image"
import { clientAuth } from "~/client/firebase.client"
import type { ProfileContext } from "~/routes/profiles"
import type { EstimateGasUpdateProfileImageAction } from "~/routes/gas/profile/update-image"
import type { LoadProfileLoader } from "~/routes/profiles/$handle/$profileId"

interface Props {
  context: ProfileContext
  closeModal: () => void
}

export function ProfileDetail({ context, closeModal }: Props) {
  // Get profile data from the loader
  const data = useLoaderData<LoadProfileLoader>()
  // Check whehter the logged in profile and the displayed profile is the same or not (check to confirm the user is the owner of the profile also).
  const isSameProfile =
    context?.account?.address === data?.profile?.owner && // check owner
    context?.loggedInProfile?.id === data?.profile?.id // check if same profile
  const accountType = context?.account?.type

  const [updateImageModalVisible, setUpdateImageModalVisible] = useState(false)

  const estimateGasFetcher = useFetcher<EstimateGasUpdateProfileImageAction>()
  const reauthenticateFetcher = useFetcher()
  const loaderFetcher = useFetcher()
  const { address, isConnected } = useAccount()

  /**
   * On first render when the profile is available and the logged in profile and the displayed profile are the same, check gas fee for updating an image.
   */
  useEffect(() => {
    if (isSameProfile && data?.profile?.tokenId) {
      if (accountType === "TRADITIONAL") {
        // Call the server
        const getEstimatedGas = async () => {
          const user = clientAuth.currentUser
          const idToken = await user?.getIdToken()
          if (!idToken) return
          estimateGasFetcher.submit(
            { idToken, tokenId: data?.profile.tokenId },
            {
              method: "post",
              action: `/gas/profile/update-image`,
            }
          )
        }

        getEstimatedGas()
      }

      if (accountType === "WALLET") {
        // 1. Force reauthenticate if NOT connected or the connected address is different than the account address.
        if (
          !isConnected ||
          !address ||
          context?.account?.address.toLowerCase() !== address?.toLowerCase()
        ) {
          reauthenticateFetcher.submit(null, {
            method: "post",
            action: "/reauthenticate",
          })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accountType,
    isSameProfile,
    data?.profile?.tokenId,
    context?.account?.address,
    isConnected,
    address,
  ])

  const openImageModal = useCallback(() => {
    setUpdateImageModalVisible(true)
  }, [])

  const closeImageModal = useCallback(() => {
    loaderFetcher.submit(null, { method: "get" })
    setUpdateImageModalVisible(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {!data?.profile.imageURI ? (
              <MdPerson size={80} color="#3f3f46" />
            ) : (
              <img
                src={data?.profile.imageURI}
                alt={data?.profile.originalHandle}
                className="w-full h-full object-cover leading-[140px] text-center text-lg text-textDark"
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
              <MdEdit size={30} className="text-orange-500" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-1">
        <h6>{data?.profile.originalHandle}</h6>
        <h6 className="font-normal text-base text-textDark">
          @{data?.profile.handle}{" "}
          {/* Display `DEFAULT` if the user is the owner of the profile */}
          {context?.account?.address === data?.profile?.owner &&
            data?.profile.default && (
              <span className="font-light italic text-textExtraLight">
                [DEFAULT]
              </span>
            )}
        </h6>
        <div className="w-full mt-1 flex justify-center items-center gap-x-3">
          {isSameProfile ? (
            <Link to={`/profiles/${data?.profile.originalHandle}/followers`}>
              <p className="font-light text-textLight">
                {data?.profile.followersCount} followers
              </p>
            </Link>
          ) : (
            <p className="font-light text-textLight">
              {data?.profile.followersCount} followers
            </p>
          )}
          {/* Show following if logged in and displayed profile is the same profile */}
          {isSameProfile && (
            <Link to={`/profiles/${data?.profile.originalHandle}/following`}>
              <p className="font-light text-textLight">
                {data?.profile.followingCount} following
              </p>
            </Link>
          )}
          <p className="font-light text-textLight">
            {data?.profile.publishesCount} videos
          </p>
        </div>
        {/* Add the ability to follow/unfollow if the logged in and displayed is NOT the same profile. */}
        {!isSameProfile && (
          <div className="w-full my-2">
            {!data?.profile?.isFollowing ? (
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
          handle={data?.profile?.handle}
          tokenId={data?.profile?.tokenId}
          oldImageURI={data?.profile?.imageURI}
          balance={context?.balance}
          closeModal={closeImageModal}
        />
      )}
    </div>
  )
}
