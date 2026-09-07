"use client";

import { useI18n } from "@/lib/locale";
import type { ShowcaseInvitation } from "@/lib/showcaseInvitations";
import { MauveCornerBloom } from "../invite-families/florals";
import { InvitationPhone } from "./InvitationPhone";

function dotted(date: string) {
  return date.replace(/\./g, " · ");
}

export function InvitationPreview({
  invitation,
  featured = false,
}: {
  invitation: ShowcaseInvitation;
  featured?: boolean;
}) {
  return (
    <InvitationPhone featured={featured}>
      {invitation.template === "floral" ? (
        <FloralCard invitation={invitation} />
      ) : invitation.template === "editorial" ? (
        <EditorialCard invitation={invitation} />
      ) : (
        <LuxuryCard invitation={invitation} />
      )}
    </InvitationPhone>
  );
}

function LuxuryCard({ invitation }: { invitation: ShowcaseInvitation }) {
  const { t } = useI18n();

  return (
    <article className="pointer-events-none flex h-full flex-col bg-[#fcfaf8] px-5 pb-6 pt-8 text-[#161513]">
      <div className="text-center">
        <p className="text-[8px] uppercase tracking-[0.38em] text-[#8a8178]">The wedding</p>
        <h3 className="font-ivory mt-4 text-[34px] uppercase leading-none tracking-[0.06em]">{invitation.bride}</h3>
        <p className="font-ivory-script my-1 text-[28px] leading-none text-[#e2c2b9]">&</p>
        <h3 className="font-ivory text-[34px] uppercase leading-none tracking-[0.06em]">{invitation.groom}</h3>
        <p className="mt-4 text-[11px] tracking-[0.28em] text-[#5c564f]">{dotted(invitation.date)}</p>
        <div className="mx-auto mt-5 h-px w-10 bg-[#d8cfc6]" />
      </div>
      <div className="mt-5 min-h-0 flex-1 overflow-hidden rounded-[4px]">
        <img src={invitation.hero} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="mt-5 text-center">
        <p className="font-ivory-script text-[22px] leading-none text-[#3a342e]">{t.inviteShowcase.story}</p>
        <div className="mx-auto mt-3 h-px w-16 bg-[#e2c2b9]" />
        <p className="mt-4 text-[9px] uppercase tracking-[0.28em] text-[#7a736c]">{t.inviteShowcase.location}</p>
        <p className="mt-2 text-[9px] uppercase tracking-[0.28em] text-[#7a736c]">{t.inviteShowcase.rsvp}</p>
      </div>
    </article>
  );
}

function FloralCard({ invitation }: { invitation: ShowcaseInvitation }) {
  const { t } = useI18n();

  return (
    <article className="pointer-events-none relative flex h-full flex-col overflow-hidden bg-[#f7efe8] px-5 pb-6 pt-10 text-[#2b2624]">
      <MauveCornerBloom className="pointer-events-none absolute -right-6 -top-4 h-32 w-36" />
      <MauveCornerBloom className="pointer-events-none absolute -bottom-8 -left-10 h-28 w-32 rotate-180" />
      <div className="relative text-center">
        <h3 className="font-mauve text-[30px] uppercase leading-none tracking-[0.08em]">{invitation.groom}</h3>
        <div className="my-2.5 flex items-center justify-center gap-3 text-[#9f7e7e]">
          <span className="h-px w-8 bg-[#c8b2aa]" />
          <span className="font-ivory-script text-[20px] italic leading-none">&</span>
          <span className="h-px w-8 bg-[#c8b2aa]" />
        </div>
        <h3 className="font-mauve text-[30px] uppercase leading-none tracking-[0.08em]">{invitation.bride}</h3>
        <p className="font-mauve mt-4 text-[15px] tracking-[0.22em] text-[#7a5c5c]">{dotted(invitation.date)}</p>
      </div>
      <div className="relative mt-5 min-h-0 flex-1 overflow-hidden rounded-t-[80px]">
        <img src={invitation.hero} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="relative mt-5 text-center">
        <p className="font-ivory-script text-[22px] text-[#9f7e7e]">{t.inviteShowcase.story}</p>
        <p className="mt-3 text-[9px] uppercase tracking-[0.26em] text-[#8a7068]">
          {t.inviteShowcase.location}
          <span className="mx-2 text-[#c8b2aa]">·</span>
          {t.inviteShowcase.rsvp}
        </p>
      </div>
    </article>
  );
}

function EditorialCard({ invitation }: { invitation: ShowcaseInvitation }) {
  const { t } = useI18n();
  const [day, month, year] = invitation.date.split(".");

  return (
    <article className="pointer-events-none flex h-full flex-col bg-[#eef1ea] px-4 pb-5 pt-8 text-[#141414]">
      <div>
        <p className="text-[8px] uppercase tracking-[0.36em] text-[#6d7468]">The wedding day</p>
        <h3 className="font-mod mt-3 text-[34px] font-medium uppercase leading-[0.88] tracking-[-0.04em]">
          {invitation.bride}
          <span className="block text-[20px] font-normal lowercase tracking-normal text-[#6d7468]">&</span>
          {invitation.groom}
        </h3>
        <p className="mt-3 text-[11px] tracking-[0.18em] text-[#3d4338]">
          {day} — {month} — {year?.slice(-2)}
        </p>
      </div>
      <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl">
        <img src={invitation.hero} alt="" className="h-full w-full object-cover object-center" />
      </div>
      <ol className="mt-5 space-y-0">
        {[t.inviteShowcase.story, t.inviteShowcase.location, t.inviteShowcase.rsvp].map((label, i) => (
          <li
            key={label}
            className="flex items-center justify-between border-t border-[#141414]/12 py-2.5 text-[11px]"
          >
            <span className="text-[9px] tracking-[0.16em] text-[#6d7468]">{String(i + 1).padStart(2, "0")}</span>
            <span className="uppercase tracking-[0.14em]">{label}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
