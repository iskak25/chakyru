"use client";

import { useState } from "react";
import type { Invitation } from "@/lib/types";
import { getTemplate } from "@/lib/templates";
import { envelopeColorKeys, envelopeForTemplate, envelopeVariants, envelopeDesigns, envelopeDesignPalette, invitationEnvelopeDesign, invitationEnvelopeColors, type EnvelopeColors } from "@/lib/envelopes";
import { EnvelopeIntro } from "./EnvelopeIntro";
import type { InvitePatch } from "./CanvasEdit";

function shade(hex: string, target: number, amount: number) {
  return "#" + [1, 3, 5].map(offset => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16);
    return Math.round(channel + (target - channel) * amount).toString(16).padStart(2, "0");
  }).join("");
}

export function EnvelopeEditor({ invitation, onChange, locale }: { invitation: Invitation; onChange: InvitePatch; locale: string }) {
  const ru = locale === "ru";
  const [preview, setPreview] = useState(0);
  const config = envelopeForTemplate(getTemplate(invitation.templateId));
  const colors = invitationEnvelopeColors(invitation.copy);
  const design = invitationEnvelopeDesign(invitation.copy);
  const theme = { ...envelopeDesignPalette(design, config.variant), ...colors };
  function update(next: EnvelopeColors) {
    onChange({ copy: { ...invitation.copy, ...Object.fromEntries(Object.entries(next).map(([key, value]) => [`envelope.color.${key}`, value])) } });
  }
  const fields = [
    ["paper", ru ? "Конверт" : "Конверт"],
    ["background", ru ? "Фон" : "Фон"],
    ["ink", ru ? "Текст" : "Текст"],
    ["seal", ru ? "Печать" : "Мөөр"],
    ["foil", ru ? "Орнамент" : "Оймо-чийме"],
    ["lining", design === "floral" ? (ru ? "Цветы и лента" : "Гүлдөр жана тасма") : (ru ? "Внутренняя сторона" : "Ички бети")],
  ] as const;
  return <div className="space-y-4">
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium">{ru ? "Дизайн конверта" : "Конверттин дизайны"}</legend>
      <div className="grid grid-cols-3 gap-2">
        {envelopeDesigns.map((value, index) => <button key={value} type="button" aria-pressed={design === value}
          className={`rounded-xl border px-2 py-3 text-xs transition-colors ${design === value ? "border-ink bg-ink/5 ring-1 ring-ink" : "border-ink/15 hover:bg-ink/5"}`}
          onClick={() => onChange({ copy: { ...invitation.copy, "envelope.design": value } })}>
          <svg viewBox="0 0 72 64" className="mx-auto mb-2 h-14 w-full" aria-hidden="true">
            {value === "classic" ? <><rect x="6" y="14" width="60" height="40" rx="3" fill="#e9dcc6"/><path d="m6 14 30 24 30-24M6 54l23-20m37 20L43 34" fill="none" stroke="#bba888"/><circle cx="36" cy="38" r="6" fill="#a7824c"/></> : <><rect x="18" y="2" width="36" height="60" rx="2" fill={value === "wave" ? "#6484ab" : "#f1e7da"}/><path d={value === "wave" ? "M44 2c12 12-11 17 0 30s-4 23-6 30" : "M34 2q8 5 2 10v40q6 5-2 10m4-60q-8 5-2 10"} fill="none" stroke={value === "wave" ? "#47658a" : "#aa8956"}/>{value === "floral" && <><path d="M24 8q18 16 0 46m24-46q-18 16 0 46" stroke="#976bac" strokeWidth="4" fill="none"/><path d="M18 32h36m-27-6 18 12m-18 0 18-12" stroke="#713b91" strokeWidth="5"/></>}<circle cx={value === "wave" ? 43 : 36} cy="32" r="5" fill="#d4a787"/></>}
          </svg>
          {(ru ? ["Классический", "Цветы и бант", "Волна"] : ["Классикалык", "Гүлдөр жана бант", "Толкун"])[index]}
        </button>)}
      </div>
    </fieldset>
    <p className="text-xs text-ink-soft">{ru ? "Выберите палитру или задайте свои цвета." : "Палитраны тандаңыз же өз түстөрүңүздү коюңуз."}</p>
    <div className="flex flex-wrap gap-2">
      {Object.entries(envelopeVariants).map(([key, palette], index) => <button
        key={key} type="button" aria-label={`${ru ? "Палитра" : "Палитра"} ${index + 1}`}
        className="h-9 w-9 rounded-full border border-black/15 ring-offset-2 focus-visible:ring-2 focus-visible:ring-ink"
        style={{ background: `linear-gradient(135deg, ${palette.paper} 65%, ${palette.seal} 65%)` }}
        onClick={() => update(Object.fromEntries(envelopeColorKeys.map(color => [color, palette[color]])))}
      />)}
    </div>
    <div className="grid grid-cols-2 gap-3">
      {fields.map(([key, label]) => <label key={key} className="space-y-1 text-xs">
        <span>{label}</span>
        <input type="color" value={theme[key]} className="block h-9 w-full cursor-pointer rounded-lg border border-ink/15" onChange={event => {
          const value = event.target.value;
          update(key === "paper" ? { paper: value, light: shade(value, 255, .22), shade: shade(value, 0, .24) } : { [key]: value });
        }} />
      </label>)}
    </div>
    <button type="button" className="text-xs underline underline-offset-4" onClick={() => {
      const copy = { ...invitation.copy };
      envelopeColorKeys.forEach(key => { delete copy[`envelope.color.${key}`]; });
      onChange({ copy });
    }}>{ru ? "Вернуть цвета дизайна" : "Дизайндын түстөрүн кайтаруу"}</button>
    {!config.enabled && <p className="text-xs text-ink-soft">{ru ? "В этом шаблоне показ конверта отключён." : "Бул шаблондо конвертти көрсөтүү өчүрүлгөн."}</p>}
    <div className="overflow-hidden rounded-xl border border-ink/10">
      <EnvelopeIntro key={`${design}:${preview}:${JSON.stringify(colors)}`} variant={config.variant} design={design} colors={colors} names={invitation.names} date={invitation.date} locale={locale} embedded>
        <button type="button" className="w-full p-6 text-sm" onClick={() => setPreview(value => value + 1)}>{ru ? "Показать конверт снова" : "Конвертти кайра көрсөтүү"}</button>
      </EnvelopeIntro>
    </div>
  </div>;
}
