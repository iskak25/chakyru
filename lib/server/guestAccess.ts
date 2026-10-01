import { getInvitationDoc } from "./invitations";
import { isInvitationPaid } from "./invitationAccess";

/** Guests can only respond to a page that is public, i.e. paid. Unpaid pages look non-existent. */
export async function guestMayWrite(invitationId: string): Promise<boolean> {
  const inv = await getInvitationDoc(invitationId);
  return Boolean(inv) && (await isInvitationPaid(inv!));
}
