import type { UserRecord } from "firebase-admin/auth"
import type { RecaptchaVerifier } from "firebase/auth"
import type { NexusGenFieldTypes } from "~/graphql/public-apis/typegen"

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier
    grecaptcha: any
    widgetId: number
  }
}

window.recaptchaVerifier = window.recaptchaVerifier || {}

export type ENV = "development" | "production" | "test"
export interface LoaderData {
  csrf: string
  user: UserRecord | null
  account: Account | null
  profile: Account["profile"] | null | undefined
  ENV: {
    NODE_ENV: ENV
  }
}

export type Account = NexusGenFieldTypes["Account"]
export type AccountType = "TRADITIONAL" | "WALLET"
export type Profile = NexusGenFieldTypes["Profile"]
export type UploadType = "avatar" | "publish"
