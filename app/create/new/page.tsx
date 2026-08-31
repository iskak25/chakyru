"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { lastCheckout, paidTemplateId, restorePaidTemplate, unlockPaidTemplate } from "@/lib/payAccess";
import { startInvitation } from "@/lib/store";

function CreateNewInner() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const template = search.get("template") || paidTemplateId() || lastCheckout()?.templateId || "";
    if (!template) {
      router.replace("/templates");
      return;
    }
    let cancelled = false;
    void (async () => {
      const restored = await restorePaidTemplate(template);
      if (cancelled) return;
      const paid = search.get("paid") === "1" || restored || paidTemplateId() === template;
      if (paid) unlockPaidTemplate(template);
      const started = startInvitation(template, { force: paid });
      if ("invitation" in started) router.replace(`/create/${started.invitation.id}`);
      else router.replace(started.href);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, search]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-ink-soft">
      ...
    </div>
  );
}

export default function CreateNewPage() {
  return (
    <Suspense>
      <CreateNewInner />
    </Suspense>
  );
}
