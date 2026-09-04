"use client";

import { useI18n } from "@/lib/locale";
import { media } from "@/lib/media";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";

export function Journal() {
  const { t } = useI18n();
  const shots = [
    { src: media.portraitA, label: t.features[0].t, offset: "" },
    { src: media.portraitB, label: t.features[1].t, offset: "lg:mt-20" },
    { src: media.portraitC, label: t.features[2].t, offset: "lg:mt-8" },
  ];

  return (
    <section className="bg-page pb-6 sm:pb-10">
      <Container>
        <div className="grid gap-5 sm:grid-cols-3 sm:gap-6 lg:gap-8">
          {shots.map((shot, i) => (
            <Reveal key={shot.src} delay={i * 80} className={shot.offset}>
              <figure>
                <div className="img-crop aspect-[3/4]">
                  <img src={shot.src} alt="" />
                </div>
                <figcaption className="mt-3 text-[10px] uppercase tracking-[0.22em] text-meta">
                  {shot.label}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
