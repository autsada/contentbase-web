import { initializeApp, getApp, getApps } from "firebase/app"
import { getAuth, setPersistence, inMemoryPersistence } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDW1tBI6rH5rbG4jOPeg7GDAvsMznC75eI",
  authDomain: "content-base-b78d7.firebaseapp.com",
  projectId: "content-base-b78d7",
  storageBucket: "content-base-b78d7.appspot.com",
  messagingSenderId: "465481815578",
  appId: "1:465481815578:web:6addd93c2945788fdce3a3",
  measurementId: "G-RL7VW430ZN",
}

function initializeFirebase() {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
}

const firebaseApp = initializeFirebase()
export const clientAuth = getAuth(firebaseApp)
setPersistence(
  clientAuth,
  typeof document === "undefined"
    ? inMemoryPersistence
    : {
        type: "NONE",
      }
)
