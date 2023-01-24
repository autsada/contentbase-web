import admin from "firebase-admin"
import {
  getApps,
  getApp,
  initializeApp,
  applicationDefault,
} from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const { NODE_ENV, FIREBASE_ADMIN_SERVICE_ACCOUNT } = process.env

function initializeAdmin() {
  return getApps().length > 0
    ? getApp()
    : initializeApp({
        credential:
          NODE_ENV === "development"
            ? admin.credential.cert(
                JSON.parse(FIREBASE_ADMIN_SERVICE_ACCOUNT || "{}")
              )
            : applicationDefault(),
      })
}

const firebaseApp = initializeAdmin()
export const auth = getAuth(firebaseApp)
