import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDownloadURL } from "firebase-admin/storage";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { getAdminStorageBucket } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
const MAX_AUDIO_SIZE = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (Number(req.headers.get("content-length")) > MAX_AUDIO_SIZE + 65536) return NextResponse.json({ error: "size" }, { status: 413 });
  const bucket = getAdminStorageBucket();
  if (!bucket) return NextResponse.json({ error: "storage-not-configured" }, { status: 503 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > MAX_AUDIO_SIZE) return NextResponse.json({ error: "size" }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const format = bytes.toString("ascii", 0, 3) === "ID3" || (bytes[0] === 255 && (bytes[1] & 0xe6) === 0xe2) ? { mime: "audio/mpeg", ext: "mp3" }
      : bytes.toString("ascii", 0, 4) === "OggS" ? { mime: "audio/ogg", ext: "ogg" }
      : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WAVE" ? { mime: "audio/wav", ext: "wav" }
      : bytes.toString("ascii", 4, 8) === "ftyp" && ["M4A ", "M4B "].includes(bytes.toString("ascii", 8, 12)) ? { mime: "audio/mp4", ext: "m4a" } : null;
    if (!format) return NextResponse.json({ error: "format" }, { status: 400 });
    const stored = bucket.file(`invitation-audio/${encodeURIComponent(session.uid)}/${randomUUID()}.${format.ext}`);
    await stored.save(bytes, { resumable: false, metadata: { contentType: format.mime, cacheControl: "public,max-age=31536000,immutable", metadata: { firebaseStorageDownloadTokens: randomUUID() } } });
    return NextResponse.json({ url: await getDownloadURL(stored) }, { status: 201 });
  } catch { return NextResponse.json({ error: "upload" }, { status: 503 }); }
}
