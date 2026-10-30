/** Имя гостя из ссылки вида /i/<имя>/<id>: без управляющих символов и лишних пробелов, не длиннее 60 знаков. */
export function cleanGuestName(raw: string | undefined | null): string {
  if (!raw) return "";
  let value = raw;
  try { value = decodeURIComponent(raw); } catch { /* уже декодировано */ }
  return value.replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
}

// Обращение «вы» → «ты» в тексте приглашения. Слова заменяются целиком; регистр первой буквы сохраняется.
const RU_FORMS: Record<string, string> = {
  ваш: "твой", ваша: "твоя", ваше: "твоё", ваши: "твои", вашу: "твою", вашего: "твоего", вашей: "твоей", вашим: "твоим",
  вас: "тебя", вам: "тебе", вами: "тобой", вы: "ты",
};
const KY_FORMS: Record<string, string> = {
  силерди: "сени", силерге: "сага", силердин: "сенин", силер: "сен", силерден: "сенден",
  сиздерди: "сизди", сиздерге: "сизге", сиздердин: "сиздин", сиздер: "сиз", сиздерден: "сизден",
};

function swapWords(text: string, forms: Record<string, string>): string {
  return text.replace(/[\p{L}]+/gu, word => {
    const to = forms[word.toLowerCase()];
    if (!to) return word;
    return word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase() ? to[0].toUpperCase() + to.slice(1) : to;
  });
}

/** Текст приглашения для конкретного гостя: имя в приветствии, обращение в единственном числе. */
export function personalizeText(partId: string, value: string, guestName: string, locale: string): string {
  if (!guestName) return value;
  const ru = locale === "ru";
  // Именное поздравление: в ссылке «Имя | должность» — имя и должность сотрудника.
  if (partId === "to-name") return guestName.split("|")[0].trim() || value;
  if (partId === "to-role") return guestName.split("|")[1]?.trim() || value;
  if (partId === "intro-title") return ru ? `Дорогой(ая) ${guestName}!` : `Урматтуу ${guestName}!`;
  if (partId === "message") return swapWords(value, ru ? RU_FORMS : KY_FORMS);
  return value;
}
