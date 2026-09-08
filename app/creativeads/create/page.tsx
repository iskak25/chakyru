"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CREATIVE_FORMATS, CREATIVE_STYLES, type CreativeFormatId, type CreativeLanguage, type CreativeStyleId } from "@/lib/creativeAds/types";
import { authHeaders } from "@/lib/accessClient";
import { useI18n } from "@/lib/locale";
import { getTemplatePhotos } from "@/lib/templatePhotos";
import { useCatalog } from "@/lib/useCatalog";
import { getUser } from "@/lib/store";
import type { EventType } from "@/lib/types";

function CreateInner() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const { templates } = useCatalog();
  const templateId = search.get("template") || templates[0]?.id || "klassika";
  const template = templates.find((item) => item.id === templateId) || templates[0];
  const copy = t.creativeAds.create;

  const [style, setStyle] = useState<CreativeStyleId>("luxury");
  const [format, setFormat] = useState<CreativeFormatId>("igPost");
  const [eventType, setEventType] = useState<EventType>(template?.eventTypes[0] || "wedding");
  const [language, setLanguage] = useState<CreativeLanguage>(locale);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const styleLabels = t.creativeAds.styles;
  const formatLabels = t.creativeAds.formats;
  const photo = useMemo(() => getTemplatePhotos(template?.id || "klassika").hero, [template?.id]);

  async function generate() {
    if (!template || busy) return;
    const user = getUser();
    if (!user || user.auth !== "google") {
      router.push(`/login?google=1&next=${encodeURIComponent(`/creativeads/create?template=${template.id}`)}`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const headers = await authHeaders();
      if (!("authorization" in headers)) {
        router.push(`/login?google=1&next=${encodeURIComponent(`/creativeads/create?template=${template.id}`)}`);
        return;
      }
      router.push(
        `/creativeads/generate?template=${encodeURIComponent(template.id)}&style=${style}&format=${format}&language=${language}&event=${eventType}`,
      );
    } catch {
      setError(copy.fail);
      setBusy(false);
    }
  }

  if (!template) {
    return (
      <div className="py-20 text-center">
        <p>{copy.noTemplate}</p>
        <Link href="/creativeads/templates" className="mt-4 inline-block underline">
          {t.creativeAds.templates.title}
        </Link>
      </div>
    );
  }

  return (
    <div className="ca-fade">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="overflow-hidden rounded-[28px] border border-[var(--ca-line)] bg-white">
            <img src={photo} alt="" className="aspect-[4/5] w-full object-cover" />
            <div className="p-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--ca-muted)]">{t.events[eventType]}</p>
              <h1 className="font-serif mt-2 text-3xl tracking-[-0.02em]">{template.name[locale]}</h1>
              <Link href="/creativeads/templates" className="mt-4 inline-block text-[11px] uppercase tracking-[0.16em] underline">
                {copy.change}
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-[36px] tracking-[-0.03em] sm:text-[44px]">{copy.title}</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ca-muted)]">{copy.subtitle}</p>

          <p className="mt-10 text-[11px] uppercase tracking-[0.18em] text-[var(--ca-muted)]">{copy.style}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {CREATIVE_STYLES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStyle(item.id)}
                className={`overflow-hidden rounded-2xl border text-left transition ${
                  style === item.id ? "border-[var(--ca-gold)] ring-1 ring-[var(--ca-gold)]" : "border-[var(--ca-line)]"
                }`}
              >
                <img src={item.scene} alt="" className="aspect-[4/3] w-full object-cover" />
                <span className="block px-2.5 py-2 text-[11px]">{styleLabels[item.id]}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--ca-muted)]">{copy.event}</span>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="mt-2 w-full rounded-2xl border border-[var(--ca-line)] bg-white px-4 py-3 text-sm"
              >
                {(Object.keys(t.events) as EventType[]).map((key) => (
                  <option key={key} value={key}>
                    {t.events[key]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--ca-muted)]">{copy.language}</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as CreativeLanguage)}
                className="mt-2 w-full rounded-2xl border border-[var(--ca-line)] bg-white px-4 py-3 text-sm"
              >
                <option value="ru">Русский</option>
                <option value="ky">Кыргызский</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>

          <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-[var(--ca-muted)]">{copy.format}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CREATIVE_FORMATS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFormat(item.id)}
                className={`rounded-2xl border px-3 py-4 text-left transition ${
                  format === item.id ? "border-[var(--ca-gold)] bg-white" : "border-[var(--ca-line)]"
                }`}
              >
                <p className="text-sm">{formatLabels[item.id]}</p>
                <p className="mt-1 text-[11px] text-[var(--ca-muted)]">{item.ratio}</p>
              </button>
            ))}
          </div>

          {error ? <p className="mt-6 text-sm text-[#8a3a2a]">{error}</p> : null}

          <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--ca-muted)]">{copy.creditHint}</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void generate()}
              className="rounded-full bg-[var(--ca-espresso)] px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-[var(--ca-cream)] disabled:opacity-60"
            >
              {busy ? copy.busy : copy.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreativeAdsCreatePage() {
  return (
    <Suspense>
      <CreateInner />
    </Suspense>
  );
}
