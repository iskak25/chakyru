"use client";

import { useI18n } from "@/lib/locale";
import { media } from "@/lib/media";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";

export function Gallery() {
  const { t } = useI18n();

  return (
    <section className="bg-page pb-10 sm:pb-16">
      <Container>
        <div className="grid gap-5 lg:grid-cols-12 lg:gap-7">
          <Reveal className="lg:col-span-7">
            <figure>
              <div className="img-crop aspect-[16/11] sm:aspect-[16/10]">
                <img src={media.finca} alt="" />
              </div>
              <figcaption className="mt-3 text-[10px] uppercase tracking-[0.22em] text-meta">
                {t.features[0].t}
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={90} className="lg:col-span-5 lg:mt-24">
            <figure>
              <div className="img-crop aspect-[4/5] max-lg:aspect-[16/11]">
                <img src={media.interior} alt="" />
              </div>
              <figcaption className="mt-3 text-[10px] uppercase tracking-[0.22em] text-meta">
                {t.features[1].t}
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={40} className="lg:col-span-5">
            <figure>
              <div className="img-crop aspect-[5/4]">
                <img src={media.grove} alt="" />
              </div>
              <figcaption className="mt-3 text-[10px] uppercase tracking-[0.22em] text-meta">
                {t.features[2].t}
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7 lg:mt-12">
            <figure>
              <div className="img-crop aspect-[16/10]">
                <img src={media.table} alt="" />
              </div>
              <figcaption className="mt-3 text-[10px] uppercase tracking-[0.22em] text-meta">
                {t.features[4].t}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
