import type { InvitationTemplate } from "@/lib/types";
import { inviteFromTemplate } from "@/lib/templateCanvas";
import { getPinterestDesign } from "@/lib/pinterestTemplates";
import { restoredTemplateImage, templateImageSource } from "@/lib/templateImageSources";
import { photoDate, splitNames } from "@/lib/photoLooks";

/** Static catalogue artwork: uses the same paper, ornament and demo data as the invitation. */
export function TemplatePaperPreview({ template, locale, eager }: {
  template: InvitationTemplate;
  locale: "ru" | "ky";
  eager: boolean;
}) {
  const invitation = inviteFromTemplate(template);
  const pearl = getPinterestDesign(invitation);
  const date = invitation.date.split("-").reverse().join(".");
  const { a, b } = splitNames(invitation.names || "Айбек & Айгүл");
  const flower = restoredTemplateImage(pearl?.photos.flower);
  const flowerCrop = pearl?.photos.flower;
  const flowerSource = invitation.gallery?.flower || flower?.source;
  const flowerArt = flowerCrop && <div className="relative mx-auto w-[26%] overflow-hidden mix-blend-multiply" style={{ aspectRatio: `${flowerCrop.w}/${flowerCrop.h}` }}>
    <img src={flowerSource || templateImageSource(flowerCrop.source)} alt="" loading={eager ? "eager" : "lazy"} decoding="async" style={flowerSource ? { width: "100%", height: "100%", objectFit: "contain" } : { position: "absolute", maxWidth: "none", width: `${flowerCrop.width / flowerCrop.w * 100}%`, height: `${flowerCrop.height / flowerCrop.h * 100}%`, left: `${-flowerCrop.x / flowerCrop.w * 100}%`, top: `${-flowerCrop.y / flowerCrop.h * 100}%` }} />
  </div>;
  if (pearl?.key === "pearl") {
    return (
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden text-center [container-type:inline-size]" style={{ color: pearl.ink, background: "linear-gradient(130deg,#ece7df 0%,#fff 12%,#e9e4db 16%,#faf9f4 24%,#fff 48%,#eae5db 52%,#fff 61%,#eee8dd 75%,#fff 88%)" }}>
        <div className="mx-[5%] mt-[16%] min-h-[90%] border-b border-[#b1a69f] bg-[#faf8ed] px-[6%] pt-[9%]" style={{ borderRadius: "48% 48% 0 0 / 30cqw 30cqw 0 0" }}>
          {flowerArt}
          <p className="my-[4%] text-[19cqw] leading-tight" style={{ fontFamily: "var(--font-vibes), cursive" }}>{invitation.names}</p>
          <p className="text-[3cqw] uppercase tracking-[.25em]">Кыз узатуу</p>
          <p className="mt-[5%] font-serif text-[5cqw]">{date}</p>
          <div className="mt-[5%]">{flowerArt}</div>
        </div>
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="marble-bg absolute inset-0 overflow-hidden p-[5%] text-center text-[#b59a7a] [container-type:inline-size]">
      <div className="gold-arch relative min-h-full overflow-hidden px-[8%] pt-[15%]">
        <div className="jpg-crystal absolute -right-[6%] -top-[2%] h-[30cqw] w-[30cqw] opacity-70" />
        <p className="relative font-serif text-[16cqw] italic leading-none">{a[0]} &amp; {b[0]}</p>
        <p className="mt-[10%] font-serif text-[4cqw] leading-relaxed">{invitation.message || (locale === "ru" ? "Приглашаем разделить с нами радость этого дня" : "Бул кубанычты биз менен бөлүшүүгө чакырабыз")}</p>
        <p className="mt-[7%] font-serif text-[7cqw] italic">{photoDate(invitation.date, locale).dottedLong}</p>
        <div className="gold-flourish mx-auto my-[8%] h-px w-1/2" />
        <div className="grid grid-cols-2 gap-3 font-serif text-[3cqw] leading-relaxed"><p>{invitation.time}<br />{locale === "ru" ? "Начало торжества" : "Тойдун башталышы"}</p><p>{invitation.venue}<br />{invitation.city}</p></div>
      </div>
    </div>
  );
}
