import { useLocation, useNavigate } from "@remix-run/react"
import { useState, useEffect, useCallback } from "react"

import { BackdropWithInfo } from "./backdrop-info"
import { FIRST_PROFILE_ID } from "~/constants"

interface Props {
  isFirstProfile: boolean
  title?: string
}

export default function FirstprofileNotification({
  isFirstProfile,
  title,
}: Props) {
  const [modalVisible, setModalVisible] = useState<boolean>()

  const { pathname } = useLocation()
  const navigate = useNavigate()

  /**
   * Check whether we have already notified user to create their first profile or not.
   */
  useEffect(() => {
    if (typeof document === "undefined") return

    const isNotified = window.localStorage.getItem(FIRST_PROFILE_ID)

    if (isFirstProfile && !isNotified) {
      setModalVisible(true)
    } else {
      setModalVisible(false)
    }
  }, [isFirstProfile])

  const closeModal = useCallback(() => {
    setModalVisible(false)
    if (typeof document !== "undefined") {
      window.localStorage.setItem(FIRST_PROFILE_ID, `${Date.now()}`)
    }
  }, [])

  function onIntentToCreateProfile() {
    if (pathname.startsWith("/create")) {
      closeModal()
    } else {
      closeModal()
      navigate("/create")
    }
  }

  function onNotToCreateProfile() {
    closeModal()
    if (pathname.startsWith("/create")) {
      navigate("/")
    }
  }

  if (!modalVisible) return null

  return (
    <BackdropWithInfo>
      <div className="px-2">
        <h6 className="text-center mt-2 mb-5">
          {title ? title : "Create First Profile"}
        </h6>
        <div className="mb-4 p-4 bg-gray-100 rounded-2xl">
          <p className="font-semibold text-left text-lg text-blueBase">
            You are almost there!, now you only need to{" "}
            <strong className="text-orange-500">
              create your first profile
            </strong>{" "}
            so you can upload, share, like, and comment on{" "}
            <strong className="font-bold text-blueDark text-lg">
              ContentBase
            </strong>
            .
          </p>
        </div>
        <h6 className="text-center">
          Would you like to create your first profile now?{" "}
          <span className="text-orange-500">It's FREE!</span>
        </h6>
      </div>

      <div className="my-6">
        <button
          className="btn-dark w-36 rounded-full"
          onClick={onIntentToCreateProfile}
        >
          Yes, please
        </button>
      </div>

      <div className="mb-2">
        <h6
          className="text-orange-400 text-center text-base"
          onClick={onNotToCreateProfile}
        >
          Maybe Later
        </h6>
      </div>
    </BackdropWithInfo>
  )
}
