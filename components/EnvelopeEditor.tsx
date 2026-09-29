"use client";

import { useState } from "react";
import type { Invitation } from "@/lib/types";
import { getTemplate } from "@/lib/templates";
import { envelopeColorKeys, envelopeForTemplate, envelopeVariants, invitationEnvelopeColors, type EnvelopeColors } from "@/lib/envelopes";
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
  const theme = { ...envelopeVariants[config.variant], ...colors };
  function update(next: EnvelopeColors) {
    onChange({ copy: { ...invitation.copy, ...Object.fromEntries(Object.entries(next).map(([key, value]) => [`envelope.color.${key}`, value])) } });
  }
  const fields = [
    ["paper", ru ? "Конверт" : "Конверт"],
    ["background", ru ? "Фон" : "Фон"],
    ["ink", ru ? "Текст" : "Текст"],
    ["seal", ru ? "Печать" : "Мөөр"],
    ["foil", ru ? "Орнамент" : "Оймо-чийме"],
    ["lining", ru ? "Внутренняя сторона" : "Ички бети"],
  ] as const;
  return <div className="space-y-4">
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
    }}>{ru ? "Вернуть цвета шаблона" : "Шаблондун түстөрүн кайтаруу"}</button>
    {!config.enabled && <p className="text-xs text-ink-soft">{ru ? "В этом шаблоне показ конверта отключён." : "Бул шаблондо конвертти көрсөтүү өчүрүлгөн."}</p>}
    <div className="overflow-hidden rounded-xl border border-ink/10">
      <EnvelopeIntro key={`${preview}:${JSON.stringify(colors)}`} variant={config.variant} colors={colors} names={invitation.names} date={invitation.date} locale={locale} embedded>
        <button type="button" className="w-full p-6 text-sm" onClick={() => setPreview(value => value + 1)}>{ru ? "Показать конверт снова" : "Конвертти кайра көрсөтүү"}</button>
      </EnvelopeIntro>
    </div>
  </div>;
}
