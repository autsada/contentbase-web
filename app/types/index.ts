import type { UserRecord } from "firebase-admin/auth"
import type { RecaptchaVerifier } from "firebase/auth"

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier
    grecaptcha: any
    widgetId: number
  }
}

window.recaptchaVerifier = window.recaptchaVerifier || {}

export interface LoaderData {
  csrf: string
  user: UserRecord | null
}