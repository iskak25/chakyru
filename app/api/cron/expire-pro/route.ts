import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { loadUserProfile } from "@/lib/server/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "auth" }, { status: 401 });
  }
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: "firebase-admin-not-configured" }, { status: 503 });
  const snap = await db.collection("users").where("accountRole", "==", "pro").get();
  let expired = 0;
  for (let offset = 0; offset < snap.docs.length; offset += 20) {
    const profiles = await Promise.all(snap.docs.slice(offset, offset + 20).map(doc => loadUserProfile(doc.id)));
    expired += profiles.filter(profile => profile?.accountRole === "guest").length;
  }
  return NextResponse.json({ expired }, { headers: { "cache-control": "no-store" } });
}
