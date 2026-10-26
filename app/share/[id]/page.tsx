"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ShareInvitationPanel } from "@/components/ShareInvitationDialog";
import { InviteSkeleton } from "@/components/Skeleton";
import { fetchInvitationRemoteMeta } from "@/lib/accessClient";
import { useI18n } from "@/lib/locale";
import type { Invitation } from "@/lib/types";

// Открытая страница: любой, кому владелец дал ссылку, вводит имя гостя и получает именную ссылку.
// Ничего секретного здесь нет: приглашение и так открыто по /i/<id>.
function SharePage() {
  const { id } = useParams<{ id: string }>();
  const { locale: stored } = useI18n();
  const forced = useSearchParams().get("lang");
  const locale = forced === "ru" || forced === "ky" ? forced : stored;
  const [inv, setInv] = useState<Invitation | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    void fetchInvitationRemoteMeta(id).then(remote => { if (alive) setInv(remote?.paid ? remote.invitation : null); });
    return () => { alive = false; };
  }, [id]);
  if (inv === undefined) return <InviteSkeleton />;
  const ru = locale === "ru";
  return <main className="flex min-h-screen items-start justify-center bg-page px-4 py-10 text-[#302a25]">
    <div className="w-full max-w-md rounded-3xl border border-black/10 bg-[#fffdf8] p-6 shadow-xl sm:p-8">
      <h1 className="font-serif text-3xl">{ru ? "Именное приглашение" : "Жеке чакыруу"}</h1>
      {inv ? <>
        <p className="mt-3 text-sm text-ink-soft">{ru ? "Введите имя гостя — получите его личную ссылку и сможете отправить её в мессенджер." : "Коноктун атын жазыңыз — анын жеке шилтемесин алып, мессенджер аркылуу жөнөтө аласыз."}</p>
        <ShareInvitationPanel invitation={inv} locale={locale} personal />
      </> : <p className="mt-4 text-sm">{ru ? "Приглашение не найдено или ссылка отключена." : "Чакыруу табылган жок же шилтеме өчүрүлгөн."}</p>}
    </div>
  </main>;
}

export default function ShareInvitationPage() { return <Suspense fallback={<InviteSkeleton />}><SharePage /></Suspense>; }
