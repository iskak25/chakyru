import { peekLessons } from "./catalogStore";
import type { LocalizedName } from "./types";

export type Lesson = {
  id: string;
  youtubeId?: Partial<LocalizedName>;
  title: LocalizedName;
  desc: LocalizedName;
};

export const lessons: Lesson[] = [
  {
    id: "start",
    title: { ky: "Чакырууну 5 мүнөттө түзүү", ru: "Создать приглашение за 5 минут" },
    desc: {
      ky: "Шаблон, ысымдар, күн жана шилтеме — башынан аягына чейин.",
      ru: "Шаблон, имена, дата и ссылка — от выбора до отправки.",
    },
  },
  {
    id: "photo-music",
    title: { ky: "Сүрөт жана музыка", ru: "Фото и музыка" },
    desc: {
      ky: "Мукабаны жүктөө жана 3D чакырууга музыка тандоо.",
      ru: "Загрузка обложки и выбор музыки для 3D-приглашения.",
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
