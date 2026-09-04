export const PHOTO_LAYOUTS = ["jpgSplash", "jpgEngage", "jpgSplit", "jpgMarble"] as const;

export type PhotoLayout = (typeof PHOTO_LAYOUTS)[number];

const byTemplate: Record<string, PhotoLayout> = {
  "shumkar-photo": "jpgSplash",
  "beshik-nur": "jpgSplash",
  "kyz-uzatuu-photo": "jpgEngage",
  balalyk: "jpgEngage",
  "ak-jooluk": "jpgSplit",
  "minimal-white": "jpgMarble",
};

export function getPhotoLayout(templateId: string): PhotoLayout {
  return byTemplate[templateId] ?? "jpgSplash";
}

export function splitNames(names: string) {
  const parts = names
    .split(/\s*[&+/]| менен | жана | и /i)
    .map((s) => s.trim())
    .filter(Boolean);
  return { a: parts[0] || "Манас", b: parts[1] || "Каныкей" };
}

const WEEKDAYS = {
  ky: ["Жекшемби", "Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума", "Ишемби"],
  ru: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
};

const MONTHS = {
  ky: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};

export function photoDate(date: string, locale: string) {
  const d = date ? new Date(`${date}T12:00:00`) : new Date("2026-10-06T12:00:00");
  const lang = locale === "ru" ? "ru" : "ky";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return {
    day,
    dayNum: d.getDate(),
    month,
    monthName: MONTHS[lang][d.getMonth()],
    year,
    yearShort: String(year).slice(-2),
    weekday: WEEKDAYS[lang][d.getDay()],
    dotted: `${day} . ${month} . ${String(year).slice(-2)}`,
    dottedFull: `${d.getDate()} . ${d.getMonth() + 1} . ${year}`,
    dottedLong: `${day}.${month}.${year}`,
  };
}

export function addHour(time: string, hours: number) {
  const [h, m] = (time || "17:00").split(":").map(Number);
  const next = ((h || 17) + hours) % 24;
  return `${String(next).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
}
