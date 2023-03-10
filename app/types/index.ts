import type { UserRecord } from "firebase-admin/auth"
import type { RecaptchaVerifier } from "firebase/auth"
import type {
  NexusGenEnums,
  NexusGenFieldTypes,
} from "~/graphql/public-apis/typegen"

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

export type SelectedFile = File & {
  path: string
  preview: string
}

export type UploadFileArgs = {
  idToken: string
  file?: File
  handle: string
}

export type UploadAvatarArgs = {
  idToken: string
  file?: File
  handle: string
  oldImageURI?: string | null
}

// export type UploadAvatarArgs = UploadFileArgs & { oldImageURI?: string | null }
export type UploadAvatarResult = {
  imageURI: string // A uri to display the image
  metadataURI: string // A uri point to the publish's metadata json file stored on nft.storage
}
export type UploadPublishArgs = UploadFileArgs & { publishId: number }
export type UploadPublishResult = {
  status: "Ok"
}

export type Account = NexusGenFieldTypes["Account"]
export type AccountType = "TRADITIONAL" | "WALLET"
export type Profile = NexusGenFieldTypes["Profile"]
export type PreviewProfile = NexusGenFieldTypes["PreviewProfile"]
export type PublishCategory = NexusGenEnums["Category"]
export type ThumbSource = NexusGenEnums["ThumbSource"]
export type Publish = NexusGenFieldTypes["Publish"]
export type PreviewPublish = NexusGenFieldTypes["PreviewPublish"]
export type WriteResult = NexusGenFieldTypes["WriteResult"]
