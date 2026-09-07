"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchTemplateAccess } from "@/lib/accessClient";
import { canEditTemplate } from "@/lib/auth";
import { unlockPaidTemplate } from "@/lib/payAccess";
import { getUser, openPaidInvitation, startInvitation } from "@/lib/store";

function CreateNewInner() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const template = search.get("template") || "";
    if (!template) {
      router.replace("/templates");
      return;
    }
    let cancelled = false;
    void (async () => {
      const access = await fetchTemplateAccess(template).catch(() => null);
      if (cancelled) return;
      if (access?.allowed) {
        unlockPaidTemplate(template, access.accessType === "pro" ? "pro" : "standard");
      }
      const canOpen = Boolean(access?.allowed || canEditTemplate(getUser(), template));
      if (!canOpen) {
        router.replace(`/templates/${encodeURIComponent(template)}`);
        return;
      }
      const started = access?.allowed ? openPaidInvitation(template) : startInvitation(template);
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
