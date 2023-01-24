import type { Session } from "@remix-run/node"
import type { UserRecord } from "firebase-admin/auth"

import { auth } from "./firebase.server"
import { getSession } from "./session.server"

export async function checkSessionCookie(session: Session) {
  try {
    const decodedIdToken = await auth.verifySessionCookie(
      session.get("session") || ""
    )
    return decodedIdToken
  } catch (error) {
    return null
  }
}

export async function requireAuth(request: Request) {
  const session = await getSession(request.headers.get("cookie"))
  const decodedIdToken = await checkSessionCookie(session)
  if (!decodedIdToken || !decodedIdToken.uid) {
    return null
  }

  return auth.getUser(decodedIdToken.uid)
}

export async function createSessionCookie(idToken: string) {
  const decodedIdToken = await auth.verifyIdToken(idToken)

  // Only process if the user just signed in in the last 5 minutes.
  if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
    const expiresIn = 1000 * 60 * 60 * 24 * 30 // 1 month
    return {
      uid: decodedIdToken.uid,
      sessionCookie: await auth.createSessionCookie(idToken, {
        expiresIn,
      }),
    }
  }

  throw new Error("Recent sign in required!")
}

/**
 * Create Firebase Auth using a wallet address as uid
 * @param address {string} - a wallet address
 */
export async function createUserIfNotExist(address: string) {
  let user: UserRecord | null = null
  try {
    user = await auth.getUser(address)
  } catch (error) {
    user = null
  }

  if (!user) {
    user = await auth.createUser({ uid: address })
  }

  return user
}

export function createCustomToken(uid: string) {
  return auth.createCustomToken(uid)
}
