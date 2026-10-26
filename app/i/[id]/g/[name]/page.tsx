import { GuestInvite } from "@/components/GuestInvite";
import { cleanGuestName } from "@/lib/personalInvite";
import { generateMetadata } from "../../page";

// Именное приглашение. Гость открывает /i/<имя>/<id>; next.config.ts переписывает адрес сюда.
export const dynamic = "force-dynamic";
export { generateMetadata };

export default async function PersonalGuestInvitePage({ params }: { params: Promise<{ id: string; name: string }> }) {
  const { name } = await params;
  return <GuestInvite guestName={cleanGuestName(name)} />;
}
