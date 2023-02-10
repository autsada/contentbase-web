import type { ENV } from "~/types"

let NODE_ENV: ENV = "development"

if (typeof window !== "undefined") {
  NODE_ENV = window.ENV.NODE_ENV
}

export const RE_DIGIT = new RegExp(/^\d+$/)
export const EMAIL_KEY_NAME = "emailForSignIn"
export const VERIFY_ID = "contentbase"
export const VERIFY_CODE = "68eiv6739eirpt6eortptbiw3854vik"
export const LOGGED_IN_KEY = "loggedIn"
export const CLEAN_UP_ID = "ctb"
export const CLEAN_UP_CODE = "eiro33746581ei88447224d64cife3"
export const WEB_URL = "http://localhost:3000"
// export const WEB_URL =
//   "https://36dd-2405-9800-b961-39d-b1b1-1e91-b0fe-6c1d.ap.ngrok.io"
export const WALLET_CONNECT_PROJECT_ID = "f9f68f7b9b67a2dbb6cc74007927090b"
export const UPLOAD_SERVICE_URL =
  NODE_ENV === "production"
    ? ""
    : "https://contentbase-upload-qyh5hhru7q-uc.a.run.app"
export const INITIAL_VISIT_ID = "ctb-initial-1675651642366"
