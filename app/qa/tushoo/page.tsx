import { notFound } from 'next/navigation';
import { templates } from '@/lib/templates';
import { inviteFromTemplate } from '@/lib/templateCanvas';
import { FormatInvite } from '@/components/FormatInvite';

/** Development-only visual matrix, including both legacy tushoo renderers. */
export default function TushooReview() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <main>{templates.filter(t => t.eventTypes.includes('tushoo')).map(template =>
    <section key={template.id} data-review-template={template.id}>
      <h2 style={{padding:12,fontSize:14}}>{template.name.ru}</h2>
      <FormatInvite invitation={inviteFromTemplate(template)} locale="ky" startOpen />
    </section>
  )}</main>;
}
