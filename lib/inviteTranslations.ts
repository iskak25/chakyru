import entries from "./inviteTranslations.json";
import themeEntries from "./inviteThemeTranslations.json";
import detailEntries from "./inviteDetailTranslations.json";
import titleEntries from "./inviteTitleTranslations.json";

const normalize = (value: string) => value.replaceAll("\\n", "\n").replace(/\s+/g, " ").trim().toLocaleLowerCase();
const translations = new Map<string, { ru: string; ky: string }>();
for (const [ru, ky, ...aliases] of [...entries, ...themeEntries, ...detailEntries, ...titleEntries]) {
  for (const value of [ru, ky, ...aliases]) translations.set(normalize(value), { ru, ky });
}

/** Only built-in copy is translated. Unknown guest names and authored text stay intact. */
export function invitationText(value: string, locale: string): string {
  if (!value) return value;
  const entry = translations.get(normalize(value));
  if (entry) {
    const translated = locale === "ru" ? entry.ru : entry.ky;
    return value === value.toLocaleUpperCase() && value !== value.toLocaleLowerCase() ? translated.toLocaleUpperCase() : translated;
  }
  if (value.includes("\n")) return value.split("\n").map(line => invitationText(line, locale)).join("\n");
  return value;
}

export const invitationDateLocale = (locale: string) => locale === "ru" ? "ru-RU" : "ky-KG";
