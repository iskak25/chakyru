import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Track = { id: string; title: string; artist: string; url: string };

async function searchDeezer(q: string): Promise<Track[]> {
  try {
    const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=15`);
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: { id: number; title: string; preview?: string; artist?: { name?: string } }[] };
    return (data.data ?? [])
      .filter((item) => item.preview)
      .map((item) => ({ id: `deezer-${item.id}`, title: item.title, artist: item.artist?.name ?? "", url: item.preview as string }));
  } catch {
    return [];
  }
}

async function searchItunes(q: string): Promise<Track[]> {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=15`);
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: { trackId: number; trackName: string; artistName: string; previewUrl?: string }[] };
    return (data.results ?? [])
      .filter((item) => item.previewUrl)
      .map((item) => ({ id: `itunes-${item.trackId}`, title: item.trackName, artist: item.artistName, url: item.previewUrl as string }));
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ results: [] });
  const [deezer, itunes] = await Promise.all([searchDeezer(q), searchItunes(q)]);
  const seen = new Set<string>();
  const results: Track[] = [];
  for (const track of [...deezer, ...itunes]) {
    const key = `${track.title.toLowerCase()}::${track.artist.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(track);
  }
  return NextResponse.json({ results: results.slice(0, 25) }, { headers: { "Cache-Control": "public, max-age=300" } });
}
