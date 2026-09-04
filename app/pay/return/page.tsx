"use client";

import { Suspense, useEffect, useRef } from "react";
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

      let grantedTemplate = templateHint;
      let grantedPlan: "standard" | "pro" = "standard";
      const deadline = Date.now() + 12000;
      while (!cancelled && Date.now() < deadline) {
        try {
          const res = await fetch("/api/pay/confirm", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ pid }),
          });
          const data = (await res.json().catch(() => null)) as {
            paid?: boolean;
            templateId?: string | null;
            plan?: string | null;
          } | null;
          if (data?.paid) {
            if (data.templateId) grantedTemplate = data.templateId;
            if (data.plan === "pro") grantedPlan = "pro";
            break;
          }
        } catch {
          /* retry */
        }
        if (grantedTemplate) {
          const access = await fetchTemplateAccess(grantedTemplate).catch(() => null);
          if (access?.allowed) {
            grantedPlan = access.accessType === "pro" ? "pro" : "standard";
            break;
          }
        }
        await new Promise((r) => window.setTimeout(r, 800));
      }

      if (cancelled) return;
      if (grantedTemplate) {
        const access = await fetchTemplateAccess(grantedTemplate).catch(() => null);
        if (access?.allowed) {
          unlockPaidTemplate(grantedTemplate, grantedPlan);
          router.replace(editorHref(grantedTemplate));
          return;
        }
        router.replace(`/templates/${encodeURIComponent(grantedTemplate)}`);
        return;
      }
      router.replace("/templates");
    }

    void openEditor();
    return () => {
      cancelled = true;
    };
  }, [router, search]);

  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <p className="label">Finik</p>
      <h1 className="font-serif mt-4 text-4xl uppercase">{t.pay.opening}</h1>
      <p className="mt-4 text-sm leading-7 text-ink-soft">{t.pay.openingHint}</p>
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
