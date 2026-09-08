"use client";

import { Chapter } from "./landing/Chapter";
import { Faq } from "./landing/Faq";
import { Hero } from "./landing/Hero";
import { HowItWorks } from "./landing/HowItWorks";
import { InvitationShowcase } from "./landing/InvitationShowcase";
import { PricingTeaser } from "./landing/PricingTeaser";
import { Showcase } from "./landing/Showcase";
import { Stats } from "./landing/Stats";

export function Landing() {
  return (
    <article className="overflow-x-hidden bg-[#f7f4ef]">
      <Hero />
      <Stats />
      <InvitationShowcase />
      <Chapter />
      <Showcase />
      <HowItWorks />
      <PricingTeaser />
      <Faq />
    </article>
  );
}
