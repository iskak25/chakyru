"use client";

import { FirebaseError, initializeApp, getApps, getApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
};

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export type GoogleProfile = {
  id: string;
  name: string;
  email: string;
  picture?: string;
};

export function googleLoginRedirectUri() {
  if (typeof window === "undefined") return "http://localhost:3000/login";
  return `${window.location.origin}/login`;
}

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

export function getFirebaseApp() {
  if (typeof window === "undefined" || !firebaseConfig.apiKey) return null;
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  return getAuth(app);
}

export async function firebaseIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export function profileFromFirebase(user: FirebaseUser): GoogleProfile {
  return {
    id: `google:${user.uid}`,
    name: user.displayName || user.email || "Google",
    email: user.email || "",
    picture: user.photoURL || undefined,
  };
}

export async function signInWithGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("config");
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return profileFromFirebase(result.user);
}

export async function signInWithGoogle(): Promise<GoogleProfile> {
  const auth = getFirebaseAuth();
  if (!auth || !isFirebaseConfigured()) throw new Error("config");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return profileFromFirebase(result.user);
}

export function startGoogleSignIn() {
  if (!GOOGLE_CLIENT_ID) throw new Error("config");
  const nonce = crypto.randomUUID();
  sessionStorage.setItem("chakyru-google-nonce", nonce);
  sessionStorage.setItem("chakyru-login-search", window.location.search);
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", googleLoginRedirectUri());
  url.searchParams.set("response_type", "id_token");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("prompt", "select_account");
  window.location.assign(url.toString());
}

export async function completeGoogleRedirect(): Promise<GoogleProfile | null> {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const idToken = params.get("id_token");
  const oauthError = params.get("error");
  if (oauthError) throw new Error(oauthError);
  if (!idToken) return null;
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  return signInWithGoogleIdToken(idToken);
}

export async function signOutFirebase() {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

export function firebaseErrorCode(err: unknown) {
  if (err instanceof Error && (err.message === "config" || err.message === "closed" || err.message === "redirect_uri_mismatch")) {
    return err.message;
  }
  if (err instanceof FirebaseError) return err.code;
  return "unknown";
}
