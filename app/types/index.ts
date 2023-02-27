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
export type SelectedFile = File & {
  path: string
  preview: string
}

export type UploadFileArgs = {
  uid: string
  file?: File
  handle: string
  oldImageURI?: string | null
}

export type UploadAvatarResult = {
  imageURI: string // A uri to display the image
  metadataURI: string // A uri point to the publish's metadata json file stored on nft.storage
}

export type UploadPublishResult = {
  publishURI: string // A uri to display the publish
  thumbnails: string[]
  metadataURI: string // A uri point to the publish's metadata json file stored on nft.storage
}
