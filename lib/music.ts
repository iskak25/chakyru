import type { EventType, InvitationTemplate } from "./types";

function wikiMp3(dir: string, file: string) {
  const enc = encodeURIComponent(file);
  return `https://upload.wikimedia.org/wikipedia/commons/transcoded/${dir}/${enc}/${enc}.mp3`;
}

export const ONLINE_TRACKS: { id: string; ky: string; ru: string; url: string; events?: EventType[] }[] = [
  {
    id: "sadyraliev-eki-zhas",
    ky: "Эки жаш · Султан Садыралиев",
    ru: "Эки жаш · Султан Садыралиев",
    url: "https://www.super.kg/media/download/99449",
    events: ["toi", "wedding"],
  },
  { id: "kyz-uzatuu", ky: "Кыз узатуу · Роза Шакирова", ru: "Кыз узатуу · Роза Шакирова", url: "https://www.super.kg/media/download/152669", events: ["kyz"] },
  { id: "bachelorette-party", ky: "Девочка гуляет · Хабиб", ru: "Девочка гуляет · Хабиб", url: "https://muzem.net/uploads/music/2024/02/Habib_Devochka_gulyaet.mp3", events: ["bachelorette"] },
  { id: "beshik-yry", ky: "Бешик ыры · Салтанат Аширова", ru: "Бешик ыры · Салтанат Аширова", url: "https://kyrgyz-audio.com/wp-content/uploads/mp3/a_153837.mp3", events: ["beshik", "jentek"] },
  { id: "tushoo-kesuu", ky: "Тушоо кесүү · Айпери Кулбаева", ru: "Тушоо кесүү · Айпери Кулбаева", url: "https://kyrgyz-audio.com/wp-content/uploads/mp3/a_275911.mp3", events: ["tushoo"] },
  { id: "tuulgan-kun", ky: "Туулган күн · Урмат Усенов, Неля", ru: "Туулган күн · Урмат Усенов, Неля", url: "https://kyrgyz-audio.com/wp-content/uploads/mp3/a_276261.mp3", events: ["birthday", "anniversary"] },
  { id: "jaramazan", ky: "Жарамазан · Чубак Сатаев", ru: "Жарамазан · Чубак Сатаев", url: "https://kyrgyz-audio.com/wp-content/uploads/2020/07/chubak_sataev_jaramazan.mp3", events: ["iftar"] },
  {
    id: "canon-gigue",
    ky: "Канон — кылдар",
    ru: "Канон — струнные",
    url: wikiMp3("8/8a", "Canon_and_Gigue_in_D.ogg"),
  },
  {
    id: "canon-piano",
    ky: "Канон — пианино",
    ru: "Канон — пианино",
    url: wikiMp3("6/62", "Pachelbel's_Canon.ogg"),
  },
  {
    id: "wedding-march",
    ky: "Үйлөнүү маршы",
    ru: "Свадебный марш",
    url: wikiMp3("c/cb", "A_Midsummer_Night's_Dream_Op._61_Wedding_March_(Mendelssohn)_European_Archive.ogg"),
  },
  {
    id: "clair",
    ky: "Clair de Lune",
    ru: "Лунный свет",
    url: wikiMp3("b/be", "Clair_de_lune_(Claude_Debussy)_Suite_bergamasque.ogg"),
  },
  {
    id: "gymnopedie",
    ky: "Гимнопедия",
    ru: "Гимнопедия",
    url: wikiMp3("c/ce", "Gymnopédie_no.3.ogg"),
  },
  {
    id: "canon-kmac",
    ky: "Канон (Kevin MacLeod)",
    ru: "Канон (Kevin MacLeod)",
    url: wikiMp3("5/59", "Kevin_MacLeod_-_Canon_in_D_Major.ogg"),
  },
];

export const DEFAULT_MUSIC_URL = ONLINE_TRACKS[0].url;

export function defaultMusicForEvent(event: EventType = "wedding") {
  return ONLINE_TRACKS.find(track => track.events?.includes(event))?.url || DEFAULT_MUSIC_URL;
}

export function templateMusicUrl(template: Pick<InvitationTemplate, "format" | "eventTypes" | "canvas">) {
  const saved = template.canvas?.musicUrl;
  return template.format === "photo" ? "" : effectiveMusicUrl(saved === DEFAULT_MUSIC_URL ? "" : saved, true, template.eventTypes[0]);
}

export function effectiveMusicUrl(url?: string, enabled = true, event?: EventType) {
  if (!enabled) return "";
  const value = (url ?? "").trim();
  const fallback = defaultMusicForEvent(event);
  if (youtubeId(value) === "FM3LfQ_urxQ" || /[?&]v=(ozgoche-kun|sadyraliev-eki-zhas)(?:&|$)/.test(value)) return fallback;
  return value || fallback;
}

export type SearchTrack = {
  id: string;
  title: string;
  artist: string;
  url: string;
};

export async function searchOnlineMusic(query: string): Promise<SearchTrack[]> {
  const q = query.trim();
  if (!q || /^https?:\/\//i.test(q)) return [];
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=20`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as {
    results?: { trackId: number; trackName: string; artistName: string; previewUrl?: string }[];
  };
  return (data.results ?? [])
    .filter((item) => item.previewUrl)
    .map((item) => ({
      id: String(item.trackId),
      title: item.trackName,
      artist: item.artistName,
      url: item.previewUrl as string,
    }));
}

export function youtubeId(url: string): string | null {
  if (!url || url.startsWith("data:")) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.replace(/^\//, "").split("/")[0] || null;
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      const i = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
      if (i >= 0) return parts[i + 1] || null;
    }
  } catch {
    return null;
  }
  return null;
}

export function musicLabel(url: string, locale: string): string {
  if (!url) return "";
  url = effectiveMusicUrl(url);
  const track = ONLINE_TRACKS.find((item) => item.url === url || url.includes(item.id));
  if (track) return locale === "ru" ? track.ru : track.ky;
  if (url.includes("Canon_and_Gigue")) return locale === "ru" ? "Канон — струнные" : "Канон — кылдар";
  if (url.includes("Pachelbel")) return locale === "ru" ? "Канон — пианино" : "Канон — пианино";
  if (url.includes("Wedding_March") || url.includes("Midsummer")) {
    return locale === "ru" ? "Свадебный марш" : "Үйлөнүү маршы";
  }
  if (url.includes("Clair_de_lune")) return locale === "ru" ? "Лунный свет" : "Clair de Lune";
  if (url.includes("Gymnop")) return locale === "ru" ? "Гимнопедия" : "Гимнопедия";
  if (url.includes("Kevin_MacLeod") || url.includes("Canon_in_D")) {
    return locale === "ru" ? "Канон (Kevin MacLeod)" : "Канон (Kevin MacLeod)";
  }
  if (url.startsWith("data:")) return locale === "ru" ? "С устройства" : "Түзмөктөн";
  if (youtubeId(url)) return "YouTube";
  return locale === "ru" ? "Ссылка" : "Шилтеме";
}
