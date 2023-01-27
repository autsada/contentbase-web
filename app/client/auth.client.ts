import {
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithCustomToken,
} from "firebase/auth"
import type { ActionCodeSettings } from "firebase-admin/auth"

import { clientAuth } from "./firebase.client"
import { EMAIL_KEY_NAME, VERIFY_CODE, VERIFY_ID, WEB_URL } from "~/constants"

export async function sendSignInWithEmailLink(email: string) {
  const actionCodeSettings: ActionCodeSettings = {
    url: `${WEB_URL}/connect/email/verify?${VERIFY_ID}=${VERIFY_CODE}`,
    // This must be true.
    handleCodeInApp: true,
    // iOS: {
    //   bundleId: "com.example.ios",
    // },
    // android: {
    //   packageName: "com.example.android",
    //   installApp: true,
    //   minimumVersion: "12",
    // },
    // dynamicLinkDomain: "example.page.link",
  }

  await sendSignInLinkToEmail(clientAuth, email, actionCodeSettings)

  // The link was successfully sent. Inform the user.
  // Save the email locally so you don't need to ask the user for it again
  // if they open the link on the same device.
  window.localStorage.setItem(EMAIL_KEY_NAME, email)
}

export async function verifyEmailAddress(email: string, emailLink: string) {
  try {
    const isLink = isSignInWithEmailLink(clientAuth, emailLink)

    if (!isLink) throw new Error("Invalid verify link")
    const credential = await signInWithEmailLink(clientAuth, email, emailLink)
    if (!credential) return null
    return credential.user.getIdToken()
  } catch (error) {
    throw error
  }
}

export function signInWithToken(token: string) {
  return signInWithCustomToken(clientAuth, token)
}
