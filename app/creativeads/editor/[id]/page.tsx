"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { authHeaders } from "@/lib/accessClient";
import type { CreativeAd } from "@/lib/creativeAds/types";
import { CreativeCanvas } from "@/components/creativeads/CreativeCanvas";
import { useI18n } from "@/lib/locale";

function EditorInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const [ad, setAd] = useState<CreativeAd | null>(null);
  const [busy, setBusy] = useState(false);
  const copy = t.creativeAds.editor;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const headers = await authHeaders();
      if (!("authorization" in headers)) {
        router.replace(`/login?google=1&next=${encodeURIComponent(`/creativeads/editor/${params.id}`)}`);
        return;
      }
      const res = await fetch(`/api/creativeads/${params.id}`, { headers, cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { item: CreativeAd };
      if (cancelled) return;
      const preferred = search.get("v");
      setAd({
        ...data.item,
        activeVariantId: preferred || data.item.activeVariantId || data.item.variants[0]?.id || "",
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id, router, search]);

  const variant = useMemo(
    () => ad?.variants.find((item) => item.id === ad.activeVariantId) || ad?.variants[0],
    [ad],
  );

  async function save() {
    if (!ad || busy) return;
    setBusy(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`/api/creativeads/${ad.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          title: ad.title,
          subtitle: ad.subtitle,
          cta: ad.cta,
          overlay: ad.overlay,
          blur: ad.blur,
          textColor: ad.textColor,
          buttonColor: ad.buttonColor,
          align: ad.align,
          fontSize: ad.fontSize,
          activeVariantId: ad.activeVariantId,
        }),
      });
      if (res.ok) router.push(`/creativeads/results/${ad.id}`);
    } finally {
      setBusy(false);
    }
  }

  if (!ad || !variant) {
    return <div className="py-24 text-center text-[var(--ca-muted)]">{copy.loading}</div>;
  }

  return (
    <div className="ca-fade pb-24 lg:pb-0">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="mx-auto w-full max-w-[420px] lg:max-w-none">
          <CreativeCanvas ad={ad} variant={variant} />
        </div>

        <div className="rounded-[28px] border border-[var(--ca-line)] bg-white p-5 sm:p-6">
          <h1 className="font-serif text-3xl tracking-[-0.03em]">{copy.title}</h1>

          <label className="mt-8 block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--ca-muted)]">{copy.headline}</span>
            <textarea
              value={ad.title}
              onChange={(e) => setAd({ ...ad, title: e.target.value })}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-[var(--ca-line)] px-4 py-3 text-sm"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--ca-muted)]">{copy.subhead}</span>
            <input
              value={ad.subtitle}
              onChange={(e) => setAd({ ...ad, subtitle: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-[var(--ca-line)] px-4 py-3 text-sm"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--ca-muted)]">{copy.button}</span>
            <input
              value={ad.cta}
              onChange={(e) => setAd({ ...ad, cta: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-[var(--ca-line)] px-4 py-3 text-sm"
            />
          </label>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => setAd({ ...ad, align })}
                className={`rounded-xl border px-3 py-2 text-[11px] uppercase tracking-[0.12em] ${
                  ad.align === align ? "border-[var(--ca-gold)]" : "border-[var(--ca-line)]"
                }`}
              >
                {copy.align[align]}
              </button>
            ))}
          </div>

          <label className="mt-6 block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--ca-muted)]">{copy.size}</span>
            <input
              type="range"
              min={28}
              max={64}
              value={ad.fontSize}
              onChange={(e) => setAd({ ...ad, fontSize: Number(e.target.value) })}
              className="mt-3 w-full"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--ca-muted)]">{copy.overlay}</span>
            <input
              type="range"
              min={0}
              max={0.7}
              step={0.01}
              value={ad.overlay}
              onChange={(e) => setAd({ ...ad, overlay: Number(e.target.value) })}
              className="mt-3 w-full"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--ca-muted)]">{copy.blur}</span>
            <input
              type="range"
              min={0}
              max={12}
              step={0.5}
              value={ad.blur}
              onChange={(e) => setAd({ ...ad, blur: Number(e.target.value) })}
              className="mt-3 w-full"
            />
          </label>

          <div className="mt-6 flex gap-3">
            {["#F5F1EA", "#0F0C0A", "#A88E6E", "#ffffff"].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setAd({ ...ad, textColor: color })}
                className="h-9 w-9 rounded-full border border-[var(--ca-line)]"
                style={{ background: color }}
                aria-label={color}
              />
            ))}
          </div>

          <div className="mt-8 hidden gap-3 lg:flex">
            <Link href={`/creativeads/results/${ad.id}`} className="rounded-full border border-[var(--ca-line)] px-5 py-3 text-[11px] uppercase tracking-[0.14em]">
              {copy.cancel}
            </Link>
            <button
              type="button"
              disabled={busy}
              onClick={() => void save()}
              className="rounded-full bg-[var(--ca-espresso)] px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ca-cream)] disabled:opacity-60"
            >
              {busy ? copy.saving : copy.save}
            </button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--ca-line)] bg-[var(--ca-cream)]/95 p-4 backdrop-blur lg:hidden">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="w-full rounded-full bg-[var(--ca-espresso)] px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--ca-cream)] disabled:opacity-60"
        >
          {busy ? copy.saving : copy.save}
        </button>
      </div>
    </div>
  );
}

export default function CreativeAdsEditorPage() {
  return (
    <Suspense>
      <EditorInner />
    </Suspense>
  );
}
