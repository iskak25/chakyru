"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getInvitation, rememberRemoteInvitation, saveInvitation } from "@/lib/store";
import { fetchInvitationRemote } from "@/lib/accessClient";
import type { Invitation } from "@/lib/types";

const LIMIT = 40;
const BURST_MS = 500;

export function useInviteHistory(id: string) {
  const [inv, setInv] = useState<Invitation | null>(null);
  const [ready, setReady] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const now = useRef<Invitation | null>(null);
  const past = useRef<Invitation[]>([]);
  const future = useRef<Invitation[]>([]);
  const burst = useRef<number | null>(null);

  const hydrate = useCallback((next: Invitation | null) => {
    now.current = next;
    setInv(next);
    setCanUndo(past.current.length > 0);
    setCanRedo(future.current.length > 0);
  }, []);

  const sync = useCallback((next: Invitation | null) => {
    now.current = next;
    setInv(next);
    setCanUndo(past.current.length > 0);
    setCanRedo(future.current.length > 0);
    if (next) saveInvitation(next);
  }, []);

  const reset = useCallback(
    (next: Invitation | null) => {
      past.current = [];
      future.current = [];
      if (burst.current) window.clearTimeout(burst.current);
      burst.current = null;
      hydrate(next);
    },
    [hydrate],
  );

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    const local = getInvitation(id) ?? null;
    reset(local);
    if (local) setReady(true);
    void fetchInvitationRemote(id).then((remote) => {
      if (cancelled) return;
      if (remote) {
        rememberRemoteInvitation(remote);
        reset(remote);
      } else if (local && local.id !== "demo") {
        saveInvitation(local);
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
      if (burst.current) window.clearTimeout(burst.current);
    };
  }, [id, reset]);

  const patch = useCallback(
    (partial: Partial<Invitation>) => {
      const current = now.current;
      if (!current) return;
      if (burst.current == null) {
        past.current = [...past.current, current].slice(-LIMIT);
        future.current = [];
      } else {
        window.clearTimeout(burst.current);
      }
      burst.current = window.setTimeout(() => {
        burst.current = null;
      }, BURST_MS);
      sync({ ...current, ...partial });
    },
    [sync],
  );

  const undo = useCallback(() => {
    const current = now.current;
    if (!current || past.current.length === 0) return;
    if (burst.current) {
      window.clearTimeout(burst.current);
      burst.current = null;
    }
    const prev = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [current, ...future.current].slice(0, LIMIT);
    sync(prev);
  }, [sync]);

  const redo = useCallback(() => {
    const current = now.current;
    if (!current || future.current.length === 0) return;
    if (burst.current) {
      window.clearTimeout(burst.current);
      burst.current = null;
    }
    const next = future.current[0];
    future.current = future.current.slice(1);
    past.current = [...past.current, current].slice(-LIMIT);
    sync(next);
  }, [sync]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (!(e.ctrlKey || e.metaKey)) return;
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  return { inv, ready, patch, undo, redo, canUndo, canRedo };
}
