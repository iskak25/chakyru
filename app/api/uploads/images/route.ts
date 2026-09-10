import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDownloadURL } from "firebase-admin/storage";
import { sessionFromBearer } from "@/lib/firebaseToken";
import { getAdminStorageBucket } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await sessionFromBearer(req.headers.get("authorization"));
  if (!session) return NextResponse.json({ error: "Войдите в аккаунт." }, { status: 401 });
  const max = 8 * 1024 * 1024;
  if (Number(req.headers.get("content-length")) > max + 65536) return NextResponse.json({ error: "Файл превышает 8 МБ." }, { status: 413 });
  const bucket = getAdminStorageBucket();
  if (!bucket) return NextResponse.json({ error: "Хранилище фотографий не настроено. Укажите адрес изображения или настройте Firebase Storage." }, { status: 503 });
  try {
    const data = await req.formData();
    const file = data.get("file");
    if (!(file instanceof File) || !file.size || file.size > max) return NextResponse.json({ error: "Выберите изображение размером до 8 МБ." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])) ? "image/jpeg"
      : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "image/png"
      : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" ? "image/webp" : "";
    if (!mime) return NextResponse.json({ error: "Поддерживаются JPG, PNG и WebP." }, { status: 400 });
    const ext = mime.split("/")[1];
    const stored = bucket.file(`invitation-images/${encodeURIComponent(session.uid)}/${randomUUID()}.${ext}`);
    await stored.save(bytes, { resumable: false, metadata: { contentType: mime, cacheControl: "public,max-age=31536000,immutable", metadata: { firebaseStorageDownloadTokens: randomUUID() } } });
    return NextResponse.json({ url: await getDownloadURL(stored) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Не удалось сохранить фотографию в Firebase Storage. Проверьте настройки хранилища." }, { status: 503 });
  }
}
