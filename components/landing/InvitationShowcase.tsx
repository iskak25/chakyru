"use client";

import { showcaseInvitations } from "@/lib/showcaseInvitations";
import { useI18n } from "@/lib/locale";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { InvitationPreview } from "./InvitationPreview";

export function InvitationShowcase() {
  const { t } = useI18n();

  return (
    <section className="bg-page pb-16 sm:pb-24">
      <Container>
        <Reveal>
          <h2 className="font-serif mx-auto max-w-[16ch] text-center text-[32px] font-normal leading-[1.08] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]">
            {t.inviteShowcase.title}
          </h2>
          <p className="mx-auto mt-5 max-w-[40ch] text-center text-[15px] leading-[1.85] text-ink-soft">
            {t.inviteShowcase.subtitle}
          </p>
        </Reveal>
      </Container>

      <div className="invite-showcase-rail mt-10 lg:mt-14">
        {showcaseInvitations.map((invitation, i) => (
          <Reveal key={invitation.id} delay={i * 110} className="invite-showcase-item">
            <InvitationPreview invitation={invitation} featured={i === 1} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
