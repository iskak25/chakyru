import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "3D той чакыруу онлайн — 3д чакыруу жасоо | Toichakyru",
  description:
    "3D той чакыруу: 3д чакыруу, той чакыруу 3d, тойго чакыруу 3d, 3d приглашение на той. Анимациялуу онлайн чакырууну 5 мүнөттө жасап, WhatsApp аркылуу жөнөтүңүз.",
  keywords: [
    "той чакыруу 3d",
    "той чакыруу 3д",
    "3d чакыруу",
    "3д чакыруу",
    "тойго чакыруу 3d",
    "3d той чакыруу",
    "үйлөнүү той чакыруу 3d",
    "3d приглашение на той",
    "3д приглашение на свадьбу",
    "анимациялуу чакыруу",
  ],
  alternates: { canonical: "https://toichakyru.com/3d-chakyruu" },
  openGraph: {
    type: "website",
    locale: "ky_KG",
    url: "https://toichakyru.com/3d-chakyruu",
    siteName: "Toichakyru",
    title: "3D той чакыруу онлайн — 3д чакыруу жасоо",
    description: "Анимациялуу 3D той чакыруу. Шаблон тандап, 5 мүнөттө жасаңыз.",
    images: ["/icon.png"],
  },
};

const faq = [
  {
    q: "3D той чакыруу деген эмне?",
    a: "3D той чакыруу (3д чакыруу) — анимациясы бар онлайн чакыруу сайты. Конок шилтемени телефонунан ачып, аттарды, датаны жана тойдун программасын кооз анимация менен көрөт.",
  },
  {
    q: "Тойго чакыруу 3d кантип жасоого болот?",
    a: "Шаблонду тандаңыз, аттарды, датаны жана жерин жазыңыз, сүрөт кошуңуз. Чакыруу 5 мүнөттө даяр болот, шилтемесин WhatsApp аркылуу жөнөтүңүз.",
  },
  {
    q: "Как сделать 3D приглашение на той или свадьбу?",
    a: "Выберите 3D-шаблон в каталоге, впишите имена, дату и место, добавьте фото. Ссылку на анимированное приглашение отправьте гостям в WhatsApp. Доступны русский и кыргызский языки.",
  },
  {
    q: "3д чакырууну WhatsApp аркылуу жөнөтсө болобу?",
    a: "Ооба. Ар бир чакыруунун өзүнчө шилтемеси бар, аны WhatsApp, Telegram же Instagram аркылуу жөнөтсөңүз болот. Эч нерсе орнотуунун кереги жок.",
  },
];

export default function ThreeDInvitationsPage() {
  return (
    <SiteShell>
      <div className="bg-cream-deep px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="label">3D чакыруу · 3D приглашения</p>
          <h1 className="font-serif mt-5 text-[40px] leading-[1.05] tracking-[-0.025em] sm:text-[60px]">
            3D той чакыруу онлайн
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-8 text-ink-soft">
            Той чакыруу 3d — анимациялуу онлайн чакыруу. 3д чакырууну шаблондон тандап, 5 мүнөттө жасаңыз
            жана конокторго WhatsApp аркылуу жөнөтүңүз. 3D приглашение на той и свадьбу на кыргызском и
            русском языках.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/templates"
              className="inline-flex h-12 items-center rounded-[12px] bg-espresso px-6 text-[11px] uppercase tracking-[0.14em] text-cream transition hover:opacity-90"
            >
              3D шаблондор
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
        <section>
          <h2 className="font-serif text-[28px] tracking-[-0.02em] sm:text-[32px]">
            Тойго чакыруу 3d — эмне үчүн ыңгайлуу
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-ink-soft">
            Кагаз чакыруу басып чыгарууну жана жеткирүүнү талап кылат. 3D той чакыруу болсо шилтеме
            гана: конок телефонунан ачып, анимацияны, аттарды, датаны, картаны жана катышуусун
            тастыктоо формасын көрөт. Үйлөнүү той, кыз узатуу, бешик той жана юбилей үчүн шаблондор бар.
          </p>
          <ul className="mt-6 space-y-2 text-[15px] leading-8 text-ink-soft">
            <li>— 3д чакыруу 5 мүнөттө даяр</li>
            <li>— WhatsApp, Telegram, Instagram аркылуу жөнөтүү</li>
            <li>— Кыргызча жана орусча</li>
            <li>— Конокторду тастыктоо (RSVP)</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-[28px] tracking-[-0.02em] sm:text-[32px]">3D приглашение на той онлайн</h2>
          <p className="mt-4 text-[15px] leading-8 text-ink-soft">
            3D-приглашение на той или свадьбу — это анимированный сайт-приглашение вместо бумажной
            открытки. Выберите шаблон, впишите имена, дату и место, отправьте ссылку гостям. Подходит для
            свадьбы, той, кыз узатуу, бешик той и юбилея.
          </p>
        </section>

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
          <p className="font-serif text-[26px] tracking-[-0.02em]">3D чакырууну азыр жасаңыз</p>
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
