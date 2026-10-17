// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { collectionDesigns, collectionTemplate } from '@/lib/collectionTemplates';
import { eventPresentations } from '@/lib/eventPresentation';
import { inviteFromTemplate } from '@/lib/templateCanvas';
import { CollectionInvite } from '@/components/CollectionInvite';
import { LocaleProvider } from '@/lib/locale';

afterEach(cleanup);
Object.defineProperty(window,'matchMedia',{value:()=>({matches:true,addEventListener(){},removeEventListener(){}})});
class Observer { observe(){} unobserve(){} disconnect(){} }
(globalThis as unknown as {IntersectionObserver:unknown}).IntersectionObserver=Observer;

describe('tushoo collection art',()=>{
  it('uses event-specific presentations throughout the requested collection range',()=>{
    const designs=collectionDesigns.filter(d=>!['wedding','kyz'].includes(d.event));
    expect(designs).toHaveLength(65);
    for (const design of designs) expect(eventPresentations[design.id]?.event).toBe(design.event);
    expect(eventPresentations['collection-wedding-olive-vow']).toBeUndefined();
  });
  const tushoo=collectionDesigns.filter(d=>d.event==='tushoo');
  for(const design of tushoo) it(`${design.id}: cover uses its generated art`,()=>{
    const inv=inviteFromTemplate(collectionTemplate(design));
    const {container}=render(<LocaleProvider><CollectionInvite invitation={inv} design={design} locale="ru"/></LocaleProvider>);
    const srcs=[...container.querySelectorAll('img')].map(i=>i.getAttribute('src')||'');
    expect(srcs.some(s=>/\/images\/event-art\/tushoo-\d\d-hero\.webp$/.test(s))).toBe(true);
    expect(container.querySelector('[data-event-hero]')).not.toBeNull();
    expect(container.querySelectorAll('input[name="attendance"]')).toHaveLength(2);
  });
});
