import { NextRequest, NextResponse } from "next/server";
import { getInvitationDoc } from "@/lib/server/invitations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "not found" }, { status: 404 });
  const invitation = await getInvitationDoc(id);
  if (!invitation) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ invitation }, { headers: { "cache-control": "no-store" } });
}
