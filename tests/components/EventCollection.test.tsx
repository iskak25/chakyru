// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
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
  it('keeps custom names, dates and uploaded cover photos in the reference design', () => {
    const design = collectionDesigns.find(d => d.id === 'collection-tushoo-first-path')!;
    const invitation = {...inviteFromTemplate(collectionTemplate(design)), names:'Үмүт & Өмүр', date:'2027-09-23', time:'14:30', gallery:{hero:'/my-child.webp'}};
    const {container} = render(<LocaleProvider><CollectionInvite invitation={invitation} design={design} locale="ru" /></LocaleProvider>);
    const cover = container.querySelector('header');
    expect(cover?.textContent).toContain('Үмүт & Өмүр');
    expect(cover?.textContent).toContain('сентября');
    expect(cover?.textContent).toContain('14:30');
    expect(cover?.querySelector('img')?.getAttribute('src')).toBe('/my-child.webp');
    expect(container.querySelector('input[name="name"]')).not.toBeNull();
  });
  it.each([
    ['collection-tushoo-first-path', 'Обряд тушоо кесу'],
    ['collection-anniversary-gold-number', 'Поздравления'],
    ['collection-beshik-moon-cradle', 'Обряд бешик той'],
    ['collection-birthday-candle-wish', 'Торт и желание'],
    ['collection-jentek-welcome-home', 'Обряд жентек'],
    ['collection-bachelorette-cherry-night', 'Сбор подруг'],
    ['collection-corporate-pine-gala', 'Шоу-программа'],
    ['collection-iftar-open-gate', 'Время ифтара'],
  ])('%s: shows the occasion programme and preserves venue photos', (id, activity) => {
    const design = collectionDesigns.find(d => d.id === id)!;
    const inv = inviteFromTemplate(collectionTemplate(design));
    const { container, rerender } = render(<LocaleProvider><CollectionInvite invitation={inv} design={design} locale="ru" /></LocaleProvider>);
    const programme = container.querySelector('[data-kyz-section="programme"]');
    expect(programme?.textContent).toContain(activity);
    expect(programme?.textContent).not.toContain('Нике жана салтанат');
    expect(container.querySelector('[data-kyz-section="location"] img')).toBeNull();
    rerender(<LocaleProvider><CollectionInvite invitation={{...inv, gallery:{...inv.gallery, venue:'/venue-test.webp'}}} design={design} locale="ru" /></LocaleProvider>);
    expect(container.querySelector('[data-kyz-section="location"] img')?.getAttribute('src')).toBe('/venue-test.webp');
  });
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
