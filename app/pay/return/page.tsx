"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { fetchTemplateAccess } from "@/lib/accessClient";
import { getFirebaseAuth } from "@/lib/firebase";
import { useI18n } from "@/lib/locale";
import { unlockPaidTemplate } from "@/lib/payAccess";

function editorHref(templateId: string) {
  return `/create/new?template=${encodeURIComponent(templateId)}`;
}

function ReturnInner() {
  const { t } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const started = useRef(false);
  const [phase, setPhase] = useState<"wait" | "opening" | "fail">("wait");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const pid = search.get("pid") || "";
    const templateHint = search.get("template") || "";

    let cancelled = false;

    async function openEditor() {
      const auth = getFirebaseAuth();
      const waitUntil = Date.now() + 8000;
      while (!cancelled && Date.now() < waitUntil) {
        await auth?.authStateReady();
        if (auth?.currentUser) break;
        await new Promise((r) => window.setTimeout(r, 200));
      }
      if (cancelled) return;

      const token = await auth?.currentUser?.getIdToken();
      if (!token) {
        const next = `${window.location.pathname}${window.location.search}`;
        router.replace(`/login?google=1&next=${encodeURIComponent(next)}`);
        return;
      }

      let grantedTemplate = "";
      let grantedPlan: "standard" | "pro" = "standard";
      const deadline = Date.now() + 45000;
      while (!cancelled && Date.now() < deadline) {
        if (pid) {
          try {
            const res = await fetch("/api/pay/confirm", {
              method: "POST",
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ pid, templateId: templateHint || undefined }),
            });
            const data = (await res.json().catch(() => null)) as {
              paid?: boolean;
              templateId?: string | null;
              plan?: string | null;
              status?: string;
            } | null;
            if (data?.paid) {
              grantedTemplate = data.templateId || templateHint;
              if (data.plan === "pro") grantedPlan = "pro";
              break;
            }
            if (data?.status === "failed" || data?.status === "cancelled" || data?.status === "refunded") {
              setPhase("fail");
              return;
            }
          } catch {
            /* retry */
          }
        }

        const checkTemplate = templateHint || grantedTemplate;
        if (checkTemplate) {
          const access = await fetchTemplateAccess(checkTemplate).catch(() => null);
          if (access?.allowed) {
            grantedTemplate = checkTemplate;
            grantedPlan = access.accessType === "pro" ? "pro" : "standard";
            break;
          }
        }
        await new Promise((r) => window.setTimeout(r, 1200));
      }

      if (cancelled) return;
      if (grantedTemplate) {
        setPhase("opening");
        unlockPaidTemplate(grantedTemplate, grantedPlan);
        router.replace(editorHref(grantedTemplate));
        return;
      }
      setPhase("fail");
    }

    void openEditor();
    return () => {
      cancelled = true;
    };
  }, [router, search]);

  const title = phase === "opening" ? t.pay.opening : phase === "fail" ? t.pay.confirmFail : t.pay.wait;
  const hint = phase === "opening" ? t.pay.openingHint : phase === "fail" ? t.pay.waitHint : t.pay.waitHint;

  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <p className="label">Finik</p>
      <h1 className="font-serif mt-4 text-4xl uppercase">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-ink-soft">{hint}</p>
      {phase === "fail" ? (
        <button
          type="button"
          className="mt-8 bg-forest px-5 py-2 text-[11px] uppercase tracking-[0.14em] text-cream"
          onClick={() => router.replace(templateHintHref(search.get("template") || ""))}
        >
          {t.nav.templates}
        </button>
      ) : null}
    </div>
  );
}

function templateHintHref(templateId: string) {
  if (!templateId) return "/templates";
  return `/templates/${encodeURIComponent(templateId)}`;
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
