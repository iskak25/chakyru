import { collectionTemplates } from '@/lib/collectionTemplates';
import { inviteFromTemplate } from '@/lib/templateCanvas';
import { FormatInvite } from '@/components/FormatInvite';
export default async function Page({params}:{params:Promise<{slug:string}>}) {
  const {slug} = await params;
  const template = collectionTemplates.find(t=>t.id === `collection-kyz-${slug}`)!;
  return <FormatInvite invitation={inviteFromTemplate(template)} locale="ky" />;
}
