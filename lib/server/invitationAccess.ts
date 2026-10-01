import { isAdminUser, loadUserProfile } from "./users";
import { canUserAccessTemplate } from "./access";
import { invitationIsPaid } from "./accessLogic";
import { sameInvitationOwner } from "./invitations";
import type { Invitation } from "../types";

const PAID_TTL_MS = 60_000;
// Only positive answers are cached, so a fresh payment is picked up immediately.
const paidCache = new Map<string, number>();

function ownerUidOf(inv: Pick<Invitation, "ownerUid" | "ownerId">) {
  if (inv.ownerUid) return inv.ownerUid;
  if (inv.ownerId) return inv.ownerId.startsWith("google:") ? inv.ownerId.slice("google:".length) : inv.ownerId;
  return "";
}

/** Server-side truth: has the page's owner paid for (or otherwise hold) its template? */
export async function isInvitationPaid(inv: Invitation): Promise<boolean> {
  const ownerUid = ownerUidOf(inv);
  if (!ownerUid) return true; // ownerless legacy page
  const key = `${ownerUid}|${inv.templateId}`;
  const hit = paidCache.get(key);
  if (hit && hit > Date.now()) return true;
  const access = await canUserAccessTemplate(ownerUid, inv.templateId);
  const paid = invitationIsPaid({
    templateKnown: Boolean(access.template),
    isFree: access.isFree,
    allowed: access.allowed,
    owned: access.owned,
  });
  if (paid) paidCache.set(key, Date.now() + PAID_TTL_MS);
  return paid;
}

export type InvitationViewer = "owner" | "public" | "none";

/**
 * Who may read this page: its owner (or an admin) always; everyone else — only after payment.
 * Unpaid pages answer "none" so callers can respond 404 and not even reveal they exist.
 */
export async function invitationViewer(
  inv: Invitation,
  session: { uid: string; email?: string } | null,
): Promise<{ viewer: InvitationViewer; paid: boolean }> {
  if (session) {
    const profile = await loadUserProfile(session.uid);
    const email = session.email || profile?.email;
    const owner = {
      ownerUid: session.uid,
      ownerId: profile?.id || `google:${session.uid}`,
      email,
    };
    const isOwner = Boolean(inv.ownerUid || inv.ownerId) && sameInvitationOwner(inv, owner);
    if (isOwner || (await isAdminUser(session.uid, email))) {
      return { viewer: "owner", paid: await isInvitationPaid(inv) };
    }
  }
  const paid = await isInvitationPaid(inv);
  return { viewer: paid ? "public" : "none", paid };
}
