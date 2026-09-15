"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchTemplateAccess, pushInvitationRemote } from "@/lib/accessClient";
import { canEditTemplate } from "@/lib/auth";
import { unlockPaidTemplate } from "@/lib/payAccess";
import { getUser, openPaidInvitation, startInvitation } from "@/lib/store";
import { useI18n } from "@/lib/locale";
import { checkoutReturn, paymentReturnHref } from "@/lib/checkoutReturn";

function CreateNewInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { locale } = useI18n();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const { templateId: template, paymentId } = checkoutReturn(search.toString());
    if (paymentId) {
      router.replace(paymentReturnHref(paymentId, template));
      return;
    }
    if (!template) {
      router.replace("/templates");
      return;
    }
    let cancelled = false;
    setFailed(false);
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
      if ("invitation" in started) {
        const saved = await pushInvitationRemote(started.invitation);
        if (cancelled) return;
        if (!saved.ok) { setFailed(true); return; }
        router.replace(started.created ? `/create/${started.invitation.id}?setup=1` : `/create/${started.invitation.id}`);
      } else router.replace(started.href);
    })().catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
    };
  }, [router, search, attempt]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-ink-soft">
      {failed ? <div className="max-w-md px-5 text-center">
        <p>{locale === "ru" ? "Не удалось сохранить приглашение. Повторите попытку — повторная оплата не нужна." : "Чакыруу сакталган жок. Кайра аракет кылыңыз — кайра төлөөнүн кереги жок."}</p>
        <button type="button" className="mt-4 underline" onClick={() => setAttempt(value => value + 1)}>{locale === "ru" ? "Повторить" : "Кайра аракет кылуу"}</button>
      </div> : "..."}
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
