"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startInvitation, takePendingTemplate } from "@/lib/store";

function CreateNewInner() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const template = search.get("template") || takePendingTemplate() || "klassika";
    const started = startInvitation(template);
    if ("invitation" in started) router.replace(`/create/${started.invitation.id}`);
    else router.replace(started.href);
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
