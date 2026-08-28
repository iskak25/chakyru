import { peekLessons } from "./catalogStore";
import type { LocalizedName } from "./types";

export type Lesson = {
  id: string;
  youtubeId?: string;
  minutes: number;
  title: LocalizedName;
  desc: LocalizedName;
};

export const lessons: Lesson[] = [
  {
    id: "start",
    minutes: 4,
    title: { ky: "Чакырууну 5 мүнөттө түзүү", ru: "Создать приглашение за 5 минут" },
    desc: {
      ky: "Шаблон, ысымдар, күн жана шилтеме — башынан аягына чейин.",
      ru: "Шаблон, имена, дата и ссылка — от выбора до отправки.",
    },
  },
  {
    id: "photo-music",
    minutes: 3,
    title: { ky: "Сүрөт жана музыка", ru: "Фото и музыка" },
    desc: {
      ky: "Мукабаны жүктөө, трек тандоо, озвучка.",
      ru: "Обложка, трек с устройства или онлайн, озвучка.",
    },
  },
  {
    id: "share-rsvp",
    minutes: 3,
    title: { ky: "WhatsApp жана RSVP", ru: "WhatsApp и RSVP" },
    desc: {
      ky: "Шилтемени конокторго жиберүү, жоопторду көрүү.",
      ru: "Отправка ссылки гостям и сбор ответов в кабинете.",
    },
  },
  {
    id: "site3d",
    minutes: 5,
    title: { ky: "3D сайт-чакыруу", ru: "3D сайт-приглашение" },
    desc: {
      ky: "Блокторду сүйрөө, стикерлер, карта.",
      ru: "Блоки, стикеры, карта и оформление страницы.",
    },
  },
  {
    id: "designers",
    minutes: 4,
    title: { ky: "Дизайнерлерге", ru: "Для дизайнеров" },
    desc: {
      ky: "Шаблонду жарыялоо жана сатуу.",
      ru: "Публикация шаблона и продажи на площадке.",
    },
  },
];

export function allLessons() {
  return peekLessons() ?? lessons;
}

export function youtubeIdFromInput(raw: string) {
  const s = raw.trim();
  if (!s) return "";
  const watch = s.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|live\/|watch\?.*?v=))([\w-]{11})/);
  if (watch?.[1]) return watch[1];
  if (/^[\w-]{11}$/.test(s)) return s;
  return s;
}
