import type { Session } from "@remix-run/node"
import type { UserRecord } from "firebase-admin/auth"

import { auth } from "./firebase.server"
import { commitSession, getSession } from "./session.server"

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

export function getUserSession(request: Request) {
  return getSession(request.headers.get("cookie"))
}

export async function getUser(request: Request) {
  const session = await getUserSession(request)
  const decodedIdToken = await checkSessionCookie(session)
  if (!decodedIdToken || !decodedIdToken.uid) {
    return null
  }
  return auth.getUser(decodedIdToken.uid)
}

export async function requireAuth(request: Request) {
  const session = await getUserSession(request)
  const user = await getUser(request)
  const headers = {
    "Set-Cookie": await commitSession(session),
  }

  return { user, headers }
}

export async function createSessionCookie(idToken: string) {
  const decodedIdToken = await auth.verifyIdToken(idToken)

  // Only process if the user just signed in in the last 5 minutes.
  if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
    const expiresIn = 1000 * 60 * 60 * 24 * 14 // 2 weeks
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
 * Create Firebase Auth for users using their own wallets to connect
 * @dev Using a wallet address as a uid
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
