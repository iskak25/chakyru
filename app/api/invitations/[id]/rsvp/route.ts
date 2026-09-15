import { NextRequest, NextResponse } from "next/server";
import { addInvitationRsvp } from "@/lib/server/invitations";
import type { RsvpStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    rsvp?: RsvpStatus;
    plusOne?: number;
    drinks?: string;
    note?: string;
    wish?: string;
  } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const rsvp = body?.rsvp;
  if (!id || id === "demo" || id === "preview" || id.startsWith("preview-") || !name || name.length > 120 || (rsvp !== "yes" && rsvp !== "no" && rsvp !== "maybe") || (body?.wish !== undefined && (typeof body.wish !== "string" || body.wish.length > 2000))) {
    return NextResponse.json({ error: "input" }, { status: 400 });
  }
  const guest = await addInvitationRsvp({
    invitationId: id,
    name,
    rsvp,
    plusOne: rsvp !== "no" && Number.isFinite(body?.plusOne) ? Math.min(19, Math.max(0, Math.floor(Number(body?.plusOne)))) : 0,
    ...(typeof body?.wish === "string" ? { wish: body.wish.trim() } : {}),
    ...(typeof body?.drinks === "string" ? { drinks: body.drinks.trim().slice(0, 120) } : {}),
    ...(typeof body?.note === "string" ? { note: body.note.trim().slice(0, 2000) } : {}),
  });
  if (!guest) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ guest });
}
