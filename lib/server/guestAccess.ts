import { getInvitationDoc } from "./invitations";
import { isInvitationPaid } from "./invitationAccess";

/** Guests can only respond to a page that is public, i.e. paid and not switched off by its owner. */
export async function guestMayWrite(invitationId: string): Promise<boolean> {
  const inv = await getInvitationDoc(invitationId);
  return Boolean(inv) && !inv!.linkDisabled && (await isInvitationPaid(inv!));
}
