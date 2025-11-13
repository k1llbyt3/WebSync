"use client"; // ✅ ensures firebase initializes only on client

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

// ✅ Initialize Firebase only once
function initFirebase(): FirebaseApp {
  if (!getApps().length) {
    try {
      // App Hosting auto initialize
      return initializeApp();
    } catch {
      // Local development fallback
      return initializeApp(firebaseConfig);
    }
  }

  return getApp();
}

const firebaseApp = initFirebase();

// ✅ Export these (SignupPage uses them)
export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

// ✅ keep project utility exports
export * from "./provider";
export * from "./client-provider";
export * from "./firestore/use-collection";
export * from "./firestore/use-doc";
export * from "./non-blocking-updates";
export * from "./non-blocking-login";
export * from "./errors";
export * from "./error-emitter";
