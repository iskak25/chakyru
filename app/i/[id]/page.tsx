import type { Metadata } from "next";
import { GuestInvite } from "@/components/GuestInvite";
import { getInvitationDoc } from "@/lib/server/invitations";
import { invitationViewer } from "@/lib/server/invitationAccess";
import { inviteShareMeta } from "@/lib/inviteShareMeta";

// Оплата меняет то, что можно показать в превью, поэтому страница не кэшируется.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const inv = await getInvitationDoc(id);
    // Нет страницы — общие мета-теги из app/layout.tsx.
    if (!inv) return {};
    // Превью видит любой, кто получил ссылку, поэтому личные данные — только у оплаченной
    // (публичной) страницы. Неоплаченная отдаёт общие теги и не индексируется.
    const { viewer } = await invitationViewer(inv, null);
    if (viewer !== "public") return { robots: { index: false, follow: false } };
    const meta = inviteShareMeta(inv);
    const url = `/i/${encodeURIComponent(id)}`;
    return {
      title: meta.title,
      description: meta.description,
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        url,
        title: meta.title,
        description: meta.description,
        images: [{ url: meta.image, width: 1200, height: 630, type: "image/jpeg", alt: meta.title }],
      },
      twitter: { card: "summary_large_image", title: meta.title, description: meta.description, images: [meta.image] },
    };
  } catch {
    return {};
  }
}

export default function GuestInvitePage() {
  return <GuestInvite />;
}
