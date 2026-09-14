import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Пригласительные на свадьбу онлайн — создать за 5 минут | Toichakyru",
  description:
    "Электронные пригласительные на свадьбу онлайн на русском и кыргызском языках. Выберите шаблон, впишите имена и дату, отправьте гостям в WhatsApp за 5 минут.",
  keywords: [
    "пригласительные на свадьбу",
    "пригласительные на свадьбу онлайн",
    "электронные пригласительные на свадьбу",
    "сайт-приглашение на свадьбу",
    "создать пригласительное онлайн",
    "шаблоны пригласительных на свадьбу",
    "приглашение на свадьбу в WhatsApp",
    "пригласительные на свадьбу бесплатно",
    "пригласительные на свадьбу Бишкек",
    "үйлөнүү тойго чакыруу",
    "үйлөнүү тойго онлайн чакыруу",
  ],
  alternates: {
    canonical: "https://toichakyru.com/priglasitelnye-na-svadbu",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://toichakyru.com/priglasitelnye-na-svadbu",
    siteName: "Toichakyru",
    title: "Пригласительные на свадьбу онлайн — создать за 5 минут",
    description:
      "Электронные пригласительные на свадьбу онлайн на русском и кыргызском языках. Готовые шаблоны, отправка в WhatsApp.",
    images: ["/icon.png"],
  },
};

const faq = [
  {
    q: "Как создать пригласительное на свадьбу онлайн?",
    a: "Выберите шаблон в каталоге, впишите имена жениха и невесты, дату и место свадьбы, добавьте фото — сайт-приглашение будет готов за 5 минут. Ссылку можно сразу отправить гостям.",
  },
  {
    q: "Можно ли отправить приглашение в WhatsApp?",
    a: "Да. Каждое пригласительное — это отдельная ссылка на сайт-приглашение, её можно скинуть гостям в WhatsApp, Instagram или любой мессенджер без установки приложений.",
  },
  {
    q: "Есть ли пригласительные на кыргызском языке?",
    a: "Да, все шаблоны доступны на русском и кыргызском языках — можно переключить язык прямо на сайте.",
  },
  {
    q: "Сколько стоит электронное пригласительное?",
    a: "Часть шаблонов доступна бесплатно для просмотра, редактирование и открытие полного доступа — платное, с ценами по каждому шаблону на странице тарифов.",
  },
];

export default function InvitationsLandingPage() {
  return (
    <SiteShell>
      <div className="bg-cream-deep px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="label">Онлайн-приглашения</p>
          <h1 className="font-serif mt-5 text-[40px] leading-[1.05] tracking-[-0.025em] sm:text-[60px]">
            Пригласительные на свадьбу онлайн
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-8 text-ink-soft">
            Электронные пригласительные на свадьбу — это красивый сайт-приглашение вместо бумажных открыток.
            Выберите шаблон, впишите имена и дату, отправьте гостям ссылку в WhatsApp — и всё готово за 5 минут.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/templates"
              className="inline-flex h-12 items-center rounded-[12px] bg-espresso px-6 text-[11px] uppercase tracking-[0.14em] text-cream transition hover:opacity-90"
            >
              Смотреть шаблоны
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center rounded-[12px] border border-[var(--line)] bg-white px-6 text-[11px] uppercase tracking-[0.14em] transition hover:border-ink/30"
            >
              Цены
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <section>
          <h2 className="font-serif text-[28px] tracking-[-0.02em] sm:text-[32px]">
            Почему электронное пригласительное удобнее бумажного
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-ink-soft">
            Заказ и доставка бумажных пригласительных на свадьбу занимают дни и стоят дорого при большом
            количестве гостей. Сайт-приглашение создаётся онлайн за пару минут, ничего не нужно печатать —
            достаточно отправить ссылку в WhatsApp, Telegram или Instagram. Гость открывает её на телефоне и
            видит имена, дату, место проведения, программу дня и форму подтверждения присутствия.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-[28px] tracking-[-0.02em] sm:text-[32px]">
            Готовые шаблоны пригласительных на свадьбу
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-ink-soft">
            В каталоге собраны шаблоны сайт-приглашений на свадьбу, той, кыз узатуу, бешик той и юбилей — от
            классического дизайна с каллиграфией до анимированных 3D-приглашений. Часть шаблонов бесплатна
            для предпросмотра, чтобы можно было выбрать подходящий стиль до оплаты.
          </p>
          <ul className="mt-6 space-y-2 text-[15px] leading-8 text-ink-soft">
            <li>— Готовый текст приглашения на свадьбу, который можно отредактировать под себя</li>
            <li>— Имена, дата, место и программа дня на одной странице</li>
            <li>— Кнопка подтверждения присутствия (RSVP) для гостей</li>
            <li>— Работает на кыргызском и русском языках</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-[28px] tracking-[-0.02em] sm:text-[32px]">
            Үйлөнүү тойго онлайн чакыруу
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-ink-soft">
            Toichakyru аркылуу үйлөнүү тойго, кыз узатууга же бешик тойго электрондук чакыруу баракчасын
            5 мүнөттүн ичинде түзө аласыз. Шаблонду тандап, аттарды жана датаны жазып, чакырууну
            WhatsApp аркылуу конокторуңузга жөнөтүңүз.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-[28px] tracking-[-0.02em] sm:text-[32px]">Частые вопросы</h2>
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
          <p className="font-serif text-[26px] tracking-[-0.02em]">Готовы создать пригласительное?</p>
          <p className="mt-3 text-[15px] leading-8 text-ink-soft">
            Выберите шаблон и отправьте гостям ссылку уже сегодня.
          </p>
          <Link
            href="/templates"
            className="mt-6 inline-flex h-12 items-center rounded-[12px] bg-espresso px-6 text-[11px] uppercase tracking-[0.14em] text-cream transition hover:opacity-90"
          >
            Выбрать шаблон
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
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />
    </SiteShell>
  );
}
