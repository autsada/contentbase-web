import { useLocation, useNavigate } from "@remix-run/react"
import { useState, useEffect, useCallback } from "react"

import { FIRST_PROFILE_ID } from "~/constants"

/**
 * @param isNoProfile // `true` if user doesn't have any profile yet
 * @param isOnlyOnce // Whether or not we need to only set modal visible for the first time user opens the app
 * @returns
 */
export function useFirstProfile(isNoProfile: boolean, isOnlyOnce: boolean) {
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const { pathname } = useLocation()
  const navigate = useNavigate()

  /**
   * Check whether we have already notified user to create their first profile or not.
   */
  useEffect(() => {
    if (typeof document === "undefined") return

    const isNotified = window.localStorage.getItem(FIRST_PROFILE_ID)

    if (isOnlyOnce) {
      if (isNoProfile && !isNotified) {
        setModalVisible(true)
      } else {
        setModalVisible(false)
      }
    } else {
      if (isNoProfile) {
        setModalVisible(true)
      } else {
        setModalVisible(false)
      }
    }
  }, [isNoProfile, isOnlyOnce])

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
    if (pathname.startsWith("/create") || pathname.startsWith("/upload")) {
      navigate("/")
    }
  }

  return { modalVisible, onIntentToCreateProfile, onNotToCreateProfile }
}
