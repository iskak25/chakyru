"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { useI18n } from "@/lib/locale";
import { getUser } from "@/lib/store";

function ReturnInner() {
  const { t } = useI18n();
  const search = useSearchParams();
  const pid = search.get("pid");
  const [ready, setReady] = useState(false);
  const [paid, setPaid] = useState(false);
  const [nextHref, setNextHref] = useState("/dashboard");

  useEffect(() => {
    const from = sessionStorage.getItem("chakyru-edit-template");
    if (from) setNextHref(`/create/new?template=${from}`);
    const tick = () => {
      const user = getUser();
      if (user && (user.plan !== "free" || (user.templates?.length ?? 0) > 0)) setPaid(true);
      setReady(true);
    };
    tick();
    window.addEventListener("chakyru-sync", tick);
    const id = window.setInterval(tick, 1500);
    return () => {
      window.removeEventListener("chakyru-sync", tick);
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <p className="label">{pid ? `Finik · ${pid.slice(0, 8)}` : "Finik"}</p>
      <h1 className="font-serif mt-4 text-4xl uppercase">
        {paid ? t.pay.success : ready ? t.pay.wait : t.pay.processing}
      </h1>
      <p className="mt-4 text-sm leading-7 text-ink-soft">
        {paid ? t.pay.successHint : t.pay.waitHint}
      </p>
      <Link
        href={paid ? nextHref : "/pricing"}
        className="mt-10 inline-block bg-forest px-6 py-3 text-[11px] uppercase tracking-[0.14em] text-cream"
      >
        {paid ? t.nav.mine : t.nav.pricing}
      </Link>
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
