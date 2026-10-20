import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase on the free Spark plan: Authentication for sign-in and Firestore for the reader's profile.
 * The web config is public by design (it identifies the project, it does not grant access); what a
 * reader may read or write is decided by firestore.rules. Call getFirebase() only in the browser.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

/** False when the NEXT_PUBLIC_FIREBASE_* variables are missing, so the site still works without accounts. */
export const accountsEnabled = Boolean(config.apiKey && config.projectId && config.appId);

let cached: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

export function getFirebase() {
  if (!accountsEnabled) return null;
  if (!cached) {
    const app = getApps().length ? getApp() : initializeApp(config);
    cached = { app, auth: getAuth(app), db: getFirestore(app) };
  }
  return cached;
}
