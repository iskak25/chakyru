import { NextRequest, NextResponse } from "next/server";
import { ONLINE_TRACKS } from "@/lib/music";

export const runtime = "nodejs";

// A few curated tracks live on third-party sites that advertise Range support
// (Accept-Ranges: bytes) but ignore the Range header and always return the full
// body. That mismatch makes <audio> fail to load/seek in most browsers, so we
// fetch the source once here and slice the response ourselves.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  const track = ONLINE_TRACKS.find((item) => item.id === id);
  const source = track?.source;
  if (!source) return NextResponse.json({ error: "not-found" }, { status: 404 });

  const upstream = await fetch(source).catch(() => null);
  if (!upstream || !upstream.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });
  const body = Buffer.from(await upstream.arrayBuffer());
  const contentType = upstream.headers.get("content-type") ?? "audio/mpeg";

  const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.get("range") ?? "");
  if (range) {
    const start = Math.min(Number(range[1]), body.length - 1);
    const end = range[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
    return new NextResponse(body.subarray(start, end + 1), {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${body.length}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Length": String(body.length),
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
