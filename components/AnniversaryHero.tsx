import type { Invitation } from "@/lib/types";
import type { AnniversaryDesign } from "@/lib/anniversaryTemplates";
import { weddingValue, type WeddingPartInfo } from "@/lib/weddingEditor";
import { WeddingPart } from "./WeddingEditor";
import css from "./AnniversaryInvite.module.css";

export function AnniversaryHero({ invitation: inv, design, locale, preview = false, eager = false }: {
  invitation: Invitation; design: AnniversaryDesign; locale: string; preview?: boolean; eager?: boolean;
}) {
  const ky = locale === "ky", mono = design.key === "monochrome";
  // Keep server and browser output identical regardless of their ICU locale data.
  const formatted = inv.date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3.$2.$1");
  const text = (id: string, fallback: string, className: string, field?: WeddingPartInfo["field"]) => preview
    ? <div className={className}>{weddingValue(inv, { id, label: id, kind: "text", fallback, field })}</div>
    : <WeddingPart id={id} label={id === "jubilee-age" ? "Возраст юбиляра" : fallback} kind="text" fallback={fallback} className={className} field={field} />;
  return <div className={css.hero}>
    {preview ? <img className={css.heroPhoto} src={inv.gallery?.hero || inv.coverImage || design.hero} alt="" loading={eager ? "eager" : "lazy"} decoding="async" /> : <WeddingPart id="photo-hero" label="Фото обложки" kind="image" slot="hero" fallback={inv.coverImage || design.hero} className={css.heroPhoto} />}
    <div className={css.heroShade} />
    <div className={css.heroTop}>
      {text("hero-event", ky ? "МААРЕКЕ" : "ЮБИЛЕЙ", css.overline)}
      {text("jubilee-age", "50", css.age)}
      {text("age-unit", ky ? "ЖАШ" : "ЛЕТ", css.ageUnit)}
    </div>
    <div className={css.heroBottom}>
      {text("names", design.names, css.heroName, "names")}
      {text("hero-invitation", ky ? "Сиздерди майрамыма чакырам" : "Приглашаю вас на мой праздник", css.heroCaption)}
      {preview ? <p className={css.heroDate}>{formatted}</p> : <WeddingPart id="event-date" label="Дата и время" kind="date" className={css.heroDate}>{formatted} · {inv.time}</WeddingPart>}
    </div>
    {mono && <div className={css.heroRule} />}
  </div>;
}
