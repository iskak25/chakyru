"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/locale";

export default function TermsPage() {
  const { locale, t } = useI18n();
  const ru = locale === "ru";
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/login" className="inline-flex items-center gap-2 text-sm text-ink-soft">
        <ArrowLeft size={16} /> {t.login.home}
      </Link>
      <h1 className="font-serif mt-6 text-4xl uppercase text-ink">{t.login.termsLink}</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-ink-soft">
        {ru ? (
          <>
            <p>Входя на Chakyru, вы соглашаетесь пользоваться сервисом для создания приглашений.</p>
            <p>Вход по имени даёт одно приглашение на этом устройстве. Подписка оформляется только через Google.</p>
            <p>Мы не продаём ваши данные. Приглашения хранятся локально в браузере, пока нет серверного аккаунта.</p>
          </>
        ) : (
          <>
            <p>Chakyru сайтына кирип, чакыруу түзүү кызматын колдонууга макулдук бересиз.</p>
            <p>Аты менен кирүү — бир чакыруу. Подписка Google аркылуу гана.</p>
            <p>Маалыматыңызды сатпайбыз. Чакыруулар ушул браузерде сакталат.</p>
          </>
        )}
      </div>
    </div>
  );
}
