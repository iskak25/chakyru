"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { canEditTemplate } from "@/lib/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useI18n } from "@/lib/locale";
import { getUser, setPendingTemplate } from "@/lib/store";

function editorHref(templateId: string) {
  return `/create/new?template=${encodeURIComponent(templateId)}&paid=1`;
}

function ReturnInner() {
  const { t } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const pid = search.get("pid");
  const [templateId, setTemplateId] = useState(search.get("template") || "");
  const [ready, setReady] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const fromQuery = search.get("template") || "";
    const fromStore = sessionStorage.getItem("chakyru-edit-template") || "";
    const chosen = fromQuery || fromStore;
    if (chosen) {
      setPendingTemplate(chosen);
      setTemplateId(chosen);
    }
    let cancelled = false;
    const mark = (id: string) => {
      const user = getUser();
      const unlocked = id ? canEditTemplate(user, id) : canEditTemplate(user);
      if (!cancelled && unlocked) setPaid(true);
      setReady(true);
    };
    async function checkServer() {
      if (!pid) return;
      try {
        const auth = getFirebaseAuth();
        await auth?.authStateReady();
        const token = await auth?.currentUser?.getIdToken();
        if (!token || cancelled) return;
        const res = await fetch(`/api/pay?pid=${encodeURIComponent(pid)}`, {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = (await res.json().catch(() => null)) as {
          paid?: boolean;
          templateId?: string | null;
        } | null;
        if (cancelled) return;
        if (data?.templateId) {
          setPendingTemplate(data.templateId);
          setTemplateId((prev) => prev || data.templateId || "");
        }
        if (data?.paid) setPaid(true);
      } catch {
        /* wait for Firestore sync */
      }
    }
    const onSync = () => mark(sessionStorage.getItem("chakyru-edit-template") || chosen);
    mark(chosen);
    void checkServer();
    window.addEventListener("chakyru-sync", onSync);
    const id = window.setInterval(() => {
      onSync();
      void checkServer();
    }, 1200);
    return () => {
      cancelled = true;
      window.removeEventListener("chakyru-sync", onSync);
      window.clearInterval(id);
    };
  }, [pid, search]);

  useEffect(() => {
    if (!paid) return;
    const target = templateId ? editorHref(templateId) : "/templates";
    const timer = window.setTimeout(() => router.replace(target), 400);
    return () => window.clearTimeout(timer);
  }, [paid, templateId, router]);

  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <p className="label">{pid ? `Finik · ${pid.slice(0, 8)}` : "Finik"}</p>
      <h1 className="font-serif mt-4 text-4xl uppercase">
        {paid ? t.pay.opening : ready ? t.pay.wait : t.pay.processing}
      </h1>
      <p className="mt-4 text-sm leading-7 text-ink-soft">
        {paid ? t.pay.openingHint : t.pay.waitHint}
      </p>
    </div>
  );
}

export default function PayReturnPage() {
  return (
    <SiteShell>
      <Suspense>
        <ReturnInner />
      </Suspense>
    </SiteShell>
  );
}
