"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TemplateRenderer } from "@/components/TemplateRenderer";
import { useI18n } from "@/lib/locale";
import { fetchInvitationRemote } from "@/lib/accessClient";
import { getInvitation, rememberRemoteInvitation } from "@/lib/store";
import { formatOf } from "@/lib/templates";
import type { Invitation } from "@/lib/types";

function GuestInviteInner() {
  const params = useParams<{ id: string }>();
  const { locale } = useI18n();
  const [inv, setInv] = useState<Invitation | null | undefined>(undefined);

  async function reload() {
    const remote = await fetchInvitationRemote(params.id);
    if (remote) {
      rememberRemoteInvitation(remote);
      setInv(remote);
      return;
    }
    setInv(getInvitation(params.id) ?? null);
  }

  useEffect(() => {
    void reload();
    const sync = () => {
      const local = getInvitation(params.id);
      if (local) setInv(local);
    };
    window.addEventListener("chakyru-sync", sync);
    return () => window.removeEventListener("chakyru-sync", sync);
  }, [params.id]);

  if (inv === undefined) {
    return <div className="min-h-screen bg-page" />;
  }

  if (!inv) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page text-ink-soft">
        404
      </div>
    );
  }

  const renderer = (
    <TemplateRenderer
      templateId={inv.templateId}
      data={inv}
      locale={locale}
      interactive
      onReload={() => void reload()}
    />
  );

  if (formatOf(inv.templateId) === "site3d") {
    return (
      <div className="min-h-svh bg-page md:flex md:justify-center md:py-6">
        <div className="relative min-h-svh w-full max-w-[430px] overflow-y-auto bg-white md:min-h-[90svh] md:border-[12px] md:border-[#1a1a1a]">
          <div className="pointer-events-none absolute left-1/2 top-0 z-50 hidden h-[30px] w-[150px] -translate-x-1/2 rounded-b-[20px] bg-[#1a1a1a] md:block" />
          {renderer}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-md overflow-hidden">{renderer}</div>
    </div>
  );
}

export default function GuestInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-page" />}>
      <GuestInviteInner />
    </Suspense>
  );
}
