"use client";

import { useEffect } from "react";
import { syncCurrentGoogleUser, watchMe, type RemoteUser } from "@/lib/db";
import { getFirebaseAuth, profileFromFirebase } from "@/lib/firebase";
import { clearUser, getUser, setUser, transferInvitations } from "@/lib/store";
import { normalizeUser, mergePaidAccess } from "@/lib/auth";

export function FirebaseSession() {
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    let cancelled = false;
    let stopWatch = () => {};
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;
    let syncingUid: string | null = null;
    const sync = async () => {
      if (cancelled || !auth.currentUser || syncingUid === auth.currentUser.uid) return;
      const uid = auth.currentUser.uid;
      syncingUid = uid;
      try {
        const remote = await syncCurrentGoogleUser();
        if (!cancelled && auth.currentUser?.uid === uid && remote) apply(remote, uid);
      } catch { /* Retry on focus or the next periodic sync. Server access still fails closed. */ }
      finally { if (syncingUid === uid) syncingUid = null; }
    };
    function apply(remote: RemoteUser, uid: string) {
      const current = getUser();
      if (cancelled || auth?.currentUser?.uid !== uid || current?.id !== `google:${uid}`) return;
      const next = mergePaidAccess(current, remote);
      if (JSON.stringify(current) !== JSON.stringify(next)) setUser(next);
      clearTimeout(expiryTimer);
      const remaining = Date.parse(remote.proExpiresAt || "") - Date.now();
      if (remaining > 0) expiryTimer = setTimeout(() => {
        const local = getUser();
        if (local?.id === `google:${uid}`) setUser(normalizeUser(local));
        void sync();
      }, Math.min(remaining + 20, 2_147_483_647));
    }
    const stopAuth = auth.onAuthStateChanged(fbUser => {
      stopWatch(); stopWatch = () => {}; clearTimeout(expiryTimer);
      if (!fbUser) { if (getUser()?.auth === "google") clearUser(); return; }
      const prev = getUser();
      const profile = profileFromFirebase(fbUser);
      if (prev && prev.id !== profile.id) transferInvitations(prev.id, profile.id);
      const sameUser = prev?.id === profile.id;
      setUser(normalizeUser({ ...(sameUser ? prev : {}), ...profile, auth: "google" }));
      void sync();
      stopWatch = watchMe(fbUser.uid, remote => { if (remote) apply(remote, fbUser.uid); }) || (() => {});
    });
    const onFocus = () => { void sync(); };
    window.addEventListener("focus", onFocus);
    const interval = setInterval(onFocus, 5 * 60_000);
    return () => {
      cancelled = true; stopAuth(); stopWatch(); clearTimeout(expiryTimer); clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  return null;
}
