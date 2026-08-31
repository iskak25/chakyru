"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { canSubscribe, planLoginHref } from "@/lib/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useI18n } from "@/lib/locale";
import { getUser } from "@/lib/store";
import type { User } from "@/lib/types";

export function PlanBuyButton({
  plan,
  templateId,
  className,
}: {
  plan: "standard" | "pro";
  templateId?: string;
  className: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const sync = () => setUserState(getUser());
    sync();
    window.addEventListener("chakyru-sync", sync);
    return () => window.removeEventListener("chakyru-sync", sync);
  }, []);

  async function checkout() {
    if (plan === "standard" && !templateId) {
      router.push("/templates");
      return;
    }
    if (!canSubscribe(user)) {
      router.push(planLoginHref(plan, templateId));
      return;
    }
    setBusy(true);
    try {
      const token = await getFirebaseAuth()?.currentUser?.getIdToken();
      if (!token) {
        router.push(planLoginHref(plan, templateId));
        return;
      }
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, templateId }),
      });
      const data = (await res.json().catch(() => null)) as {
        paymentUrl?: string;
        granted?: boolean;
        error?: string;
      } | null;
        if (data?.granted) {
        router.push(templateId ? `/create/new?template=${encodeURIComponent(templateId)}&paid=1` : "/templates");
        return;
      }
      if (!res.ok || !data?.paymentUrl) {
        const hint = data?.error ? ` (${data.error})` : "";
        window.alert((res.status === 503 ? t.pay.notConfigured : t.pay.fail) + hint);
        return;
      }
      window.location.href = data.paymentUrl;
    } catch {
      window.alert(t.pay.fail);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!user || busy || started.current) return;
    const search = new URLSearchParams(window.location.search);
    if (search.get("pay") !== plan) return;
    const from = search.get("from") || "";
    if (plan === "standard" && templateId && from && from !== templateId) return;
    started.current = true;
    void checkout();
  }, [user, plan, busy, templateId]);

  return (
    <button type="button" className={className} disabled={busy} onClick={() => void checkout()}>
      {busy ? t.pay.processing : t.buy}
    </button>
  );
}
