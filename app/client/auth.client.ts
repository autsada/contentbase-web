import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth"

import { clientAuth } from "./firebase.client"

export function signInWithPhone(phoneNumber: string) {
  const recaptcha = new RecaptchaVerifier(
    "button",
    {
      size: "invisible",
      callback: () => {},
    },
    clientAuth
  )
  return signInWithPhoneNumber(clientAuth, phoneNumber, recaptcha)
}
