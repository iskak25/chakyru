"use client";

import { Play } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { useI18n } from "@/lib/locale";
import { useCatalog } from "@/lib/useCatalog";

function LessonCard({
  youtubeId,
  title,
  desc,
  minutes,
  coming,
  watch,
  minLabel,
}: {
  youtubeId?: string;
  title: string;
  desc: string;
  minutes: number;
  coming: string;
  watch: string;
  minLabel: string;
}) {
  const ready = Boolean(youtubeId);
  return (
    <article>
      {ready ? (
        <div className="aspect-video bg-page">
          <iframe
            title={title}
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative flex aspect-video items-center justify-center bg-cream-deep">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">
            <Play size={18} fill="currentColor" />
          </span>
          <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.16em] text-meta">
            {coming}
          </span>
        </div>
      )}
      <div className="pt-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-meta">
          {minutes} {minLabel}
        </p>
        <h2 className="font-serif mt-2 text-2xl uppercase">{title}</h2>
        <p className="mt-3 text-sm leading-7 tracking-wide text-ink-soft">{desc}</p>
        {ready ? (
          <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-meta underline underline-offset-4">{watch}</p>
        ) : null}
      </div>
    </article>
  );
}

export default function LearnPage() {
  const { locale, t } = useI18n();
  const { lessons } = useCatalog();
  return (
    <SiteShell>
      <div className="bg-cream-deep px-5 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">{t.learn.kicker}</p>
          <h1 className="font-serif mt-6 text-5xl uppercase sm:text-6xl">{t.learn.title}</h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 tracking-wide text-ink-soft">{t.learn.sub}</p>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 md:grid-cols-2">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            youtubeId={lesson.youtubeId}
            title={lesson.title[locale]}
            desc={lesson.desc[locale]}
            minutes={lesson.minutes}
            coming={t.learn.coming}
            watch={t.learn.watch}
            minLabel={t.learn.minutes}
          />
        ))}
      </div>
    </SiteShell>
  );
}
