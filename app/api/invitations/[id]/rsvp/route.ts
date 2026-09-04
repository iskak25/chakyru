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
  } | null;
  const name = body?.name?.trim() || "";
  const rsvp = body?.rsvp;
  if (!id || !name || (rsvp !== "yes" && rsvp !== "no" && rsvp !== "maybe")) {
    return NextResponse.json({ error: "input" }, { status: 400 });
  }
  const guest = await addInvitationRsvp({
    invitationId: id,
    name,
    rsvp,
    plusOne: Number.isFinite(body?.plusOne) ? Math.max(0, Number(body?.plusOne)) : 0,
  });
  if (!guest) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ guest });
}
