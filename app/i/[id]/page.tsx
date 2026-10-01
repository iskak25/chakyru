"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TemplateRenderer } from "@/components/TemplateRenderer";
import { useI18n } from "@/lib/locale";
import { fetchInvitationRemoteMeta } from "@/lib/accessClient";
import { DemoWatermark, demoNote } from "@/components/DemoMark";
import { getInvitation, rememberRemoteInvitation } from "@/lib/store";
import { formatOf } from "@/lib/templates";
import type { Invitation } from "@/lib/types";
import { GuestWishForm } from "@/components/GuestWishForm";
import { InviteSkeleton } from "@/components/Skeleton";

function GuestInviteInner() {
  const params = useParams<{ id: string }>();
  const { locale } = useI18n();
  const [inv, setInv] = useState<Invitation | null | undefined>(undefined);
  // Anything but a server-confirmed payment is shown as a demo (also when we only have the local copy).
  const [demo, setDemo] = useState(true);

  async function reload() {
    const remote = await fetchInvitationRemoteMeta(params.id);
    if (remote) {
      rememberRemoteInvitation(remote.invitation);
      setInv(remote.invitation);
      setDemo(!remote.paid);
      return;
    }
    setDemo(true);
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
    return <InviteSkeleton />;
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
      <div className="bg-page">
        {demo ? <DemoWatermark /> : null}
        {demo ? <p className="mx-auto max-w-[430px] px-4 py-3 text-center text-xs text-ink-soft">{demoNote(locale)}</p> : null}
        <div className="mx-auto h-auto w-full max-w-[430px]">{renderer}<GuestWishForm key={inv.id} invitationId={inv.id} locale={locale} /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      {demo ? <DemoWatermark /> : null}
      {demo ? <p className="mx-auto max-w-md px-4 py-3 text-center text-xs text-ink-soft">{demoNote(locale)}</p> : null}
      <div className="mx-auto max-w-md overflow-hidden">{renderer}<GuestWishForm key={inv.id} invitationId={inv.id} locale={locale} /></div>
    </div>
  );
}

export default function GuestInvitePage() {
  return (
    <Suspense fallback={<InviteSkeleton />}>
      <GuestInviteInner />
    </Suspense>
  );
}
