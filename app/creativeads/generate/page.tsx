"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authHeaders } from "@/lib/accessClient";
import type { CreativeFormatId, CreativeLanguage, CreativeStyleId } from "@/lib/creativeAds/types";
import { useI18n } from "@/lib/locale";
import { getTemplatePhotos } from "@/lib/templatePhotos";
import type { EventType } from "@/lib/types";

const STEPS = 5;

function GenerateInner() {
  const { t } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const started = useRef(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const copy = t.creativeAds.generate;
  const templateId = search.get("template") || "klassika";
  const preview = getTemplatePhotos(templateId).hero;

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let cancelled = false;

    async function run() {
      for (let i = 0; i < STEPS; i++) {
        if (cancelled) return;
        setStep(i);
        await new Promise((r) => window.setTimeout(r, 700));
      }
      try {
        const headers = await authHeaders();
        if (!("authorization" in headers)) {
          router.replace(`/login?google=1&next=${encodeURIComponent(`/creativeads/create?template=${templateId}`)}`);
          return;
        }
        const res = await fetch("/api/creativeads/generate", {
          method: "POST",
          headers,
          body: JSON.stringify({
            templateId,
            style: (search.get("style") || "luxury") as CreativeStyleId,
            format: (search.get("format") || "igPost") as CreativeFormatId,
            language: (search.get("language") || "ru") as CreativeLanguage,
            eventType: (search.get("event") || "wedding") as EventType,
          }),
        });
        const data = (await res.json().catch(() => null)) as { item?: { id: string }; error?: string } | null;
        if (!res.ok || !data?.item?.id) {
          if (data?.error === "credits") setError(copy.noCredits);
          else if (data?.error === "access") setError(copy.noAccess);
          else setError(copy.fail);
          return;
        }
        setStep(STEPS);
        router.replace(`/creativeads/results/${data.item.id}`);
      } catch {
        setError(copy.fail);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [copy.fail, copy.noAccess, copy.noCredits, router, search, templateId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F0C0A] text-[#F5F1EA]">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#A88E6E]">CreativeAds</p>
          <h1 className="font-serif mt-4 max-w-[14ch] text-[40px] leading-[1.02] tracking-[-0.035em] sm:text-[52px]">
            {copy.title}
          </h1>
          <p className="mt-4 text-sm text-white/60">{copy.subtitle}</p>
          <ol className="mt-10 space-y-3">
            {copy.steps.map((label, i) => (
              <li key={label} className={`flex items-center gap-3 text-sm ${i <= step ? "text-white" : "text-white/35"}`}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] ${i < step ? "bg-[#A88E6E]" : i === step ? "border border-[#A88E6E]" : "border border-white/20"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {label}
              </li>
            ))}
          </ol>
          {error ? (
            <div className="mt-8">
              <p className="text-sm text-[#E2B8A8]">{error}</p>
              <button
                type="button"
                className="mt-4 rounded-full border border-white/20 px-5 py-2 text-[11px] uppercase tracking-[0.16em]"
                onClick={() => router.push(`/creativeads/create?template=${encodeURIComponent(templateId)}`)}
              >
                {copy.retry}
              </button>
            </div>
          ) : null}
        </div>
        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[28px]">
          <img src={preview} alt="" className="aspect-[4/5] w-full object-cover opacity-80 blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default function CreativeAdsGeneratePage() {
  return (
    <Suspense>
      <GenerateInner />
    </Suspense>
  );
}
