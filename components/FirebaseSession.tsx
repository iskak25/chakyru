"use client";

import { useEffect } from "react";
import { upsertGoogleUser, watchMe } from "@/lib/db";
import { getFirebaseAuth, profileFromFirebase } from "@/lib/firebase";
import { clearUser, getUser, setUser, transferInvitations } from "@/lib/store";
import { normalizeUser, mergePaidAccess } from "@/lib/auth";

export function FirebaseSession() {
  useEffect(() => {
    let cancelled = false;
    let stopAuth = () => {};
    let stopWatch = () => {};
    try {
      const auth = getFirebaseAuth();
      if (!auth) return;
      auth.authStateReady().then(() => {
        if (cancelled) return;
        stopAuth = auth.onAuthStateChanged((fbUser) => {
          stopWatch();
          stopWatch = () => {};
          if (!fbUser) {
            const local = getUser();
            // #region agent log
            fetch("http://127.0.0.1:7861/ingest/fdb6035a-9503-48b4-894a-ead00d842d89", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c008f9" },
              body: JSON.stringify({
                sessionId: "c008f9",
                hypothesisId: "B",
                location: "FirebaseSession.tsx:no-fb",
                message: "firebase signed out",
                data: { localAuth: local?.auth ?? null, willClear: local?.auth === "google" },
                timestamp: Date.now(),
              }),
            }).catch(() => {});
            // #endregion
            if (local?.auth === "google") clearUser();
            return;
          }
          const prev = getUser();
          const profile = profileFromFirebase(fbUser);
          if (prev && prev.id !== profile.id) transferInvitations(prev.id, profile.id);
          const next = normalizeUser({
            ...prev,
            ...profile,
            auth: "google",
            role: prev?.role ?? "host",
            plan: prev?.auth === "google" ? prev.plan : "free",
          });
          setUser(next);
          void fbUser.getIdToken().then((token) =>
            fetch("/api/me/sync", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null),
          );
          void upsertGoogleUser({
            firebaseUid: fbUser.uid,
            id: profile.id,
            name: profile.name,
            email: profile.email,
            picture: profile.picture,
            plan: next.plan,
          })
            .then((remote) => {
              if (cancelled || !remote) return;
              const current = getUser();
              if (!current || current.id !== remote.id) return;
              if (current.accountRole === remote.accountRole && current.plan === remote.plan && JSON.stringify(current.templates ?? []) === JSON.stringify(remote.templates ?? [])) return;
              setUser(mergePaidAccess(current, remote));
            })
            .catch(() => {});
          const unwatch = watchMe(fbUser.uid, (remote) => {
            if (cancelled || !remote) return;
            const current = getUser();
            if (!current || current.auth !== "google") return;
            if (current.accountRole === remote.accountRole && current.plan === remote.plan && JSON.stringify(current.templates ?? []) === JSON.stringify(remote.templates ?? [])) return;
            setUser(mergePaidAccess(current, remote));
          });
          if (unwatch) stopWatch = unwatch;
        });
      });
    } catch {
      return;
    }

    return () => {
      cancelled = true;
      stopWatch();
      stopAuth();
    };
  }, []);

  return null;
}
