"use client";

import { Chapter } from "./landing/Chapter";
import { Faq } from "./landing/Faq";
import { Features } from "./landing/Features";
import { Hero } from "./landing/Hero";
import { HowItWorks } from "./landing/HowItWorks";
import { Intro } from "./landing/Intro";
import { InvitationShowcase } from "./landing/InvitationShowcase";
import { Journal } from "./landing/Journal";
import { PricingTeaser } from "./landing/PricingTeaser";
import { Showcase } from "./landing/Showcase";

export function Landing() {
  return (
    <article className="overflow-x-hidden bg-page">
      <Hero />
      <Intro />
      <Journal />
      <InvitationShowcase />
      <Chapter />
      <Features />
      <Showcase />
      <HowItWorks />
      <PricingTeaser />
      <Faq />
    </article>
  );
}
