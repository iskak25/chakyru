import Link from "next/link";

export function GuestResponseLinks({ invitationId, templateId, locale }: { invitationId?: string; templateId?: string; locale: string }) {
  const query = invitationId ? `invitation=${encodeURIComponent(invitationId)}` : `template=${encodeURIComponent(templateId || "")}`;
  return <div className="mt-4 flex flex-wrap gap-3">
    {(["answers", "wishes"] as const).map(tab => <Link key={tab} href={`/responses?${query}&tab=${tab}`} className="inline-flex min-h-11 items-center rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-ink hover:bg-cream">
      {tab === "answers" ? (locale === "ru" ? "Ответы гостей" : "Коноктордун жооптору") : (locale === "ru" ? "Пожелания гостей" : "Коноктордун каалоолору")}
    </Link>)}
  </div>;
}
