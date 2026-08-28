function wikiMp3(dir: string, file: string) {
  const enc = encodeURIComponent(file);
  return `https://upload.wikimedia.org/wikipedia/commons/transcoded/${dir}/${enc}/${enc}.mp3`;
}

export const ONLINE_TRACKS: { id: string; ky: string; ru: string; url: string }[] = [
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

export function effectiveMusicUrl(url?: string, enabled = true) {
  if (!enabled) return "";
  return (url ?? "").trim() || DEFAULT_MUSIC_URL;
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
