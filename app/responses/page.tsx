"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { firebaseIdToken } from "@/lib/firebase";
import { useI18n } from "@/lib/locale";
import type { Invitation } from "@/lib/types";

function Responses() {
  const params = useSearchParams();
  const { locale } = useI18n();
  const ru = locale === "ru";
  const tr = (a: string, b: string) => ru ? a : b;
  const [items, setItems] = useState<Invitation[]>([]);
  const [selected, setSelected] = useState("");
  const [tab, setTab] = useState(params.get("tab") === "wishes" ? "wishes" : "answers");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [login, setLogin] = useState(false);
  const templateId = params.get("template");
  const invitationId = params.get("invitation");
  const load = useCallback(async () => {
    setLoading(true); setError(""); setLogin(false);
    try {
      const token = await firebaseIdToken();
      if (!token) { setItems([]); setLogin(true); return; }
      const response = await fetch("/api/invitations", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (response.status === 401) { setItems([]); setLogin(true); return; }
      if (!response.ok) throw new Error("load");
      const data = await response.json();
      if (!Array.isArray(data.invitations)) throw new Error("load");
      const owned = (data.invitations as Invitation[]).filter(inv => (!templateId || inv.templateId === templateId) && (!invitationId || inv.id === invitationId));
      setItems(owned);
      setSelected(current => owned.some(inv => inv.id === current) ? current : owned[0]?.id || "");
    } catch { setError(ru ? "Не удалось загрузить ответы. Попробуйте ещё раз." : "Жооптор жүктөлгөн жок. Кайра аракет кылыңыз."); }
    finally { setLoading(false); }
  }, [templateId, invitationId, ru]);
  useEffect(() => { void load(); }, [load]);
  const invitation = items.find(inv => inv.id === selected);
  const guests = invitation?.guests || [];
  const wishes = invitation?.wishes || [];
  const yes = guests.filter(g => g.rsvp === "yes");
  const total = yes.reduce((sum, g) => sum + 1 + Math.max(0, Number(g.plusOne) || 0), 0);
  return <SiteShell>
    <Link href="/dashboard" className="text-sm underline">← {tr("Мои приглашения", "Менин чакырууларым")}</Link>
    <h1 className="font-serif mt-6 text-4xl">{tr("Ответы и пожелания гостей", "Коноктордун жооптору жана каалоолору")}</h1>
    <p className="mt-3 text-sm text-ink-soft">{tr("Здесь собраны ответы на ваши приглашения.", "Бул жерде чакырууларыңызга келген жооптор чогултулган.")}</p>
    <div className="my-6 flex flex-wrap items-center gap-3">
      {items.length > 1 && <label className="text-sm">{tr("Приглашение", "Чакыруу")} <select className="ml-2 rounded-xl border p-3" value={selected} onChange={e => setSelected(e.target.value)}>{items.map(inv => <option key={inv.id} value={inv.id}>{inv.names || inv.id} · {inv.date}</option>)}</select></label>}
      <button type="button" disabled={loading} onClick={() => void load()} className="rounded-xl border bg-white px-4 py-3 text-sm disabled:opacity-50">{loading ? tr("Загрузка…", "Жүктөлүүдө…") : tr("Обновить", "Жаңыртуу")}</button>
    </div>
    {error && <p role="alert" className="mb-5 text-rose">{error}</p>}
    {login ? <Link className="underline" href={`/login?next=${encodeURIComponent(`/responses?${params.toString()}`)}`}>{tr("Войдите, чтобы посмотреть ответы своих гостей", "Конокторуңуздун жоопторун көрүү үчүн кириңиз")}</Link> : !loading && !error && !invitation ? <p>{tr("У вас пока нет сохранённых приглашений для этого шаблона. Создайте приглашение и поделитесь ссылкой с гостями.", "Бул шаблон үчүн сакталган чакырууларыңыз жок. Чакыруу түзүп, шилтемени конокторго жөнөтүңүз.")}</p> : null}
    {invitation && <>
      <h2 className="font-serif mb-5 text-2xl">{invitation.names} · {invitation.date}</h2>
      <div className="mb-6 flex flex-wrap gap-3" role="tablist" aria-label={tr("Ответы гостей", "Коноктордун жооптору")}>
        {["answers", "wishes"].map(value => <button type="button" role="tab" aria-selected={tab === value} key={value} onClick={() => setTab(value)} className={`rounded-xl border px-5 py-3 text-sm ${tab === value ? "bg-espresso text-cream" : "bg-white"}`}>{value === "answers" ? `${tr("Ответы гостей", "Коноктордун жооптору")} (${guests.length})` : `${tr("Пожелания гостей", "Коноктордун каалоолору")} (${wishes.length})`}</button>)}
      </div>
      {tab === "answers" ? <section>
        <p className="mb-5 text-sm text-ink-soft">{tr("Придут", "Келет")}: {yes.length} · {tr("Не придут", "Келбейт")}: {guests.filter(g => g.rsvp === "no").length} · {tr("Возможно", "Балким")}: {guests.filter(g => g.rsvp === "maybe").length} · {tr("Всего ожидается людей", "Жалпы күтүлгөн адам саны")}: {total}</p>
        {!guests.length ? <p>{tr("Ответов пока нет. Поделитесь приглашением с гостями.", "Жооптор азырынча жок. Чакырууну конокторго жөнөтүңүз.")}</p> : <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-b bg-cream"><tr>{[tr("Имя", "Аты"), tr("Ответ", "Жооп"), tr("Доп. гости", "Кошумча коноктор"), tr("Напитки", "Суусундуктар"), tr("Комментарий / питание", "Комментарий / тамак-аш")].map(label => <th className="p-4 font-medium" key={label}>{label}</th>)}</tr></thead><tbody>{guests.map(g => <tr className="border-b last:border-0" key={g.id}><td className="p-4">{g.name}</td><td className="p-4">{g.rsvp === "yes" ? tr("Придёт", "Келет") : g.rsvp === "no" ? tr("Не придёт", "Келбейт") : g.rsvp === "maybe" ? tr("Возможно", "Балким") : tr("Нет ответа", "Жооп жок")}</td><td className="p-4">{g.plusOne || 0}</td><td className="p-4">{g.drinks || "—"}</td><td className="max-w-sm whitespace-pre-wrap break-words p-4">{g.note || "—"}</td></tr>)}</tbody></table></div>}
      </section> : <section className="space-y-4">{!wishes.length ? <p>{tr("Пожеланий пока нет.", "Каалоолор азырынча жок.")}</p> : wishes.map(wish => <article className="rounded-2xl border bg-white p-5" key={wish.id}><h3 className="font-medium">{wish.name}</h3><p className="mt-3 whitespace-pre-wrap break-words text-ink-soft">{wish.text}</p></article>)}</section>}
    </>}
  </SiteShell>;
}

export default function ResponsesPage() { return <Suspense fallback={<div className="p-8">…</div>}><Responses /></Suspense>; }
