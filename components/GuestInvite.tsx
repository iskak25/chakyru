"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { TemplateRenderer } from "@/components/TemplateRenderer";
import { useI18n } from "@/lib/locale";
import { fetchInvitationRemoteMeta } from "@/lib/accessClient";
import { DemoWatermark, demoNote } from "@/components/DemoMark";
import { getInvitation, rememberRemoteInvitation } from "@/lib/store";
import { formatOf } from "@/lib/templates";
import type { Invitation } from "@/lib/types";
import { GuestWishForm } from "@/components/GuestWishForm";
import { PreviewBackBar } from "@/components/PreviewBackBar";
import { InviteSkeleton } from "@/components/Skeleton";

function GuestInviteInner({ guestName }: { guestName?: string }) {
  const params = useParams<{ id: string }>();
  const { locale: storedLocale } = useI18n();
  // Ссылка вида /i/<id>?lang=ru фиксирует язык приглашения независимо от настроек браузера гостя.
  const search = useSearchParams();
  const forced = search.get("lang");
  // ?preview=1 ставит редактор при предпросмотре; плашка «Назад» только там, где есть локальная копия владельца.
  const preview = search.get("preview") === "1";
  const locale = forced === "ru" || forced === "ky" ? forced : storedLocale;
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
      data={guestName ? { ...inv, guestName } : inv}
      locale={locale}
      interactive
      onReload={() => void reload()}
    />
  );

  const backBar = preview && getInvitation(inv.id) ? <PreviewBackBar id={inv.id} locale={locale} belowBand={demo} /> : null;

  if (formatOf(inv.templateId) === "site3d") {
    return (
      <div className="bg-page">
        {backBar}
        {demo ? <DemoWatermark /> : null}
        {demo ? <p className="mx-auto max-w-[430px] px-4 py-3 text-center text-xs text-ink-soft">{demoNote(locale)}</p> : null}
        <div className="mx-auto h-auto w-full max-w-[430px]">{renderer}<GuestWishForm key={inv.id} invitationId={inv.id} locale={locale} /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      {backBar}
      {demo ? <DemoWatermark /> : null}
      {demo ? <p className="mx-auto max-w-md px-4 py-3 text-center text-xs text-ink-soft">{demoNote(locale)}</p> : null}
      <div className="mx-auto max-w-md overflow-hidden">{renderer}<GuestWishForm key={inv.id} invitationId={inv.id} locale={locale} /></div>
    </div>
  );
}

export function GuestInvite({ guestName }: { guestName?: string }) {
  return (
    <Suspense fallback={<InviteSkeleton />}>
      <GuestInviteInner guestName={guestName} />
    </Suspense>
  );
}
