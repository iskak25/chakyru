import { NextResponse } from "next/server";
import type { StockPage, StockPhoto } from "@/lib/stock";

export const dynamic = "force-dynamic";

const UA = "Chakyru/1.0 (wedding invitations; localhost)";

function num(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function clip(value: string, max = 80) {
  return value.trim().slice(0, max) || "wedding";
}

async function fromPexels(q: string, page: number): Promise<StockPage | null> {
  const key = process.env.PEXELS_API_KEY?.trim();
  if (!key) return null;
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", q);
  url.searchParams.set("per_page", "24");
  url.searchParams.set("page", String(page));
  const res = await fetch(url, { headers: { Authorization: key, "User-Agent": UA } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    photos?: { id: number; alt?: string; photographer?: string; src?: { medium?: string; large?: string } }[];
  };
  const items: StockPhoto[] = (data.photos ?? [])
    .map((p) => ({
      id: `pexels-${p.id}`,
      thumb: p.src?.medium || p.src?.large || "",
      src: p.src?.large || p.src?.medium || "",
      alt: p.alt || q,
      author: p.photographer || "Pexels",
    }))
    .filter((p) => p.src);
  return { items, page, source: "pexels" };
}

async function fromUnsplash(q: string, page: number): Promise<StockPage | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key) return null;
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", q);
  url.searchParams.set("per_page", "24");
  url.searchParams.set("page", String(page));
  url.searchParams.set("orientation", "portrait");
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, "User-Agent": UA } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    results?: {
      id: string;
      alt_description?: string;
      user?: { name?: string };
      urls?: { small?: string; regular?: string };
    }[];
  };
  const items: StockPhoto[] = (data.results ?? [])
    .map((p) => ({
      id: `unsplash-${p.id}`,
      thumb: p.urls?.small || p.urls?.regular || "",
      src: p.urls?.regular || p.urls?.small || "",
      alt: p.alt_description || q,
      author: p.user?.name || "Unsplash",
    }))
    .filter((p) => p.src);
  return { items, page, source: "unsplash" };
}

async function fromOpenverse(q: string, page: number): Promise<StockPage> {
  const url = new URL("https://api.openverse.org/v1/images/");
  url.searchParams.set("q", q);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", "20");
  url.searchParams.set("category", "photograph");
  url.searchParams.set("mature", "false");
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return { items: [], page, source: "openverse" };
  const data = (await res.json()) as {
    results?: { id: string; title?: string; url?: string; thumbnail?: string; creator?: string }[];
  };
  const items: StockPhoto[] = (data.results ?? [])
    .map((p) => ({
      id: `ov-${p.id}`,
      thumb: p.thumbnail || p.url || "",
      src: p.url || p.thumbnail || "",
      alt: p.title || q,
      author: p.creator || "Openverse",
    }))
    .filter((p) => p.src);
  return { items, page, source: "openverse" };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = clip(searchParams.get("q") || "elegant wedding");
  const page = num(searchParams.get("page"), 1);
  try {
    const pageData =
      (await fromPexels(q, page)) || (await fromUnsplash(q, page)) || (await fromOpenverse(q, page));
    return NextResponse.json(pageData);
  } catch {
    return NextResponse.json({ items: [], page, source: "openverse" } satisfies StockPage, { status: 200 });
  }
}
