import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";

export type SeoLandingContent = {
  label: string;
  h1: string;
  intro: string;
  sections: { h2: string; text: string }[];
  bullets: string[];
  faq: { q: string; a: string }[];
};

export function SeoLanding({ content }: { content: SeoLandingContent }) {
  const { label, h1, intro, sections, bullets, faq } = content;
  return (
    <SiteShell>
      <div className="bg-cream-deep px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="label">{label}</p>
          <h1 className="font-serif mt-5 text-[40px] leading-[1.05] tracking-[-0.025em] sm:text-[60px]">{h1}</h1>
          <p className="mt-5 max-w-xl text-[15px] leading-8 text-ink-soft">{intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/templates"
              className="inline-flex h-12 items-center rounded-[12px] bg-espresso px-6 text-[11px] uppercase tracking-[0.14em] text-cream transition hover:opacity-90"
            >
              Шаблондор
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center rounded-[12px] border border-[var(--line)] bg-white px-6 text-[11px] uppercase tracking-[0.14em] transition hover:border-ink/30"
            >
              Баасы
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        {sections.map((s, i) => (
          <section key={s.h2} className={i ? "mt-12" : undefined}>
            <h2 className="font-serif text-[28px] tracking-[-0.02em] sm:text-[32px]">{s.h2}</h2>
            <p className="mt-4 text-[15px] leading-8 text-ink-soft">{s.text}</p>
            {i === 0 && (
              <ul className="mt-6 space-y-2 text-[15px] leading-8 text-ink-soft">
                {bullets.map((b) => (
                  <li key={b}>— {b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="mt-12">
          <h2 className="font-serif text-[28px] tracking-[-0.02em] sm:text-[32px]">Көп берилүүчү суроолор</h2>
          <div className="mt-6 space-y-8">
            {faq.map((item) => (
              <div key={item.q}>
                <h3 className="text-[17px] font-medium text-ink">{item.q}</h3>
                <p className="mt-2 text-[15px] leading-8 text-ink-soft">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14 rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-8 text-center" style={{ boxShadow: "var(--shadow-soft)" }}>
          <p className="font-serif text-[26px] tracking-[-0.02em]">Чакырууну азыр жасаңыз</p>
          <Link
            href="/templates"
            className="mt-6 inline-flex h-12 items-center rounded-[12px] bg-espresso px-6 text-[11px] uppercase tracking-[0.14em] text-cream transition hover:opacity-90"
          >
            Шаблон тандоо
          </Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
    </SiteShell>
  );
}
