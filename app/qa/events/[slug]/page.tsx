import { notFound } from 'next/navigation';
import { collectionDesigns, collectionTemplate } from '@/lib/collectionTemplates';
import { eventPresentation } from '@/lib/eventPresentation';
import { inviteFromTemplate } from '@/lib/templateCanvas';
import { EventReview } from './review';

export default async function Page({ params }: { params: Promise<{slug: string}> }) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const {slug} = await params;
  const design = collectionDesigns.find(d => d.id === `collection-${slug}` || d.id === `collection-tushoo-${slug}`);
  if (!design || !eventPresentation(design.id)) notFound();
  return <EventReview invitation={inviteFromTemplate(collectionTemplate(design))} design={design}/>;
}
