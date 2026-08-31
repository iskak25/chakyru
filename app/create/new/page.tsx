"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { canEditTemplate } from "@/lib/auth";
import { getUser, startInvitation, takePendingTemplate } from "@/lib/store";

function CreateNewInner() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const template = search.get("template") || takePendingTemplate() || "";
    const waitForPay = search.get("paid") === "1";
    if (!template) {
      router.replace("/templates");
      return;
    }

    let cancelled = false;
    let tries = 0;
    const maxTries = waitForPay ? 25 : 8;

    const go = () => {
      if (cancelled) return;
      const started = startInvitation(template);
      if ("invitation" in started) {
        router.replace(`/create/${started.invitation.id}`);
        return;
      }
      tries += 1;
      if (canEditTemplate(getUser(), template) || tries >= maxTries) {
        router.replace(started.href);
        return;
      }
      window.setTimeout(go, 400);
    };

    go();
    const onSync = () => {
      if (cancelled) return;
      if (!canEditTemplate(getUser(), template)) return;
      const started = startInvitation(template);
      if ("invitation" in started) router.replace(`/create/${started.invitation.id}`);
    };
    window.addEventListener("chakyru-sync", onSync);
    return () => {
      cancelled = true;
      window.removeEventListener("chakyru-sync", onSync);
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
