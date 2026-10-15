import { collectionDesigns } from './collectionTemplates';

/** Generated cover and border illustrations for the non-wedding events, taken in template order
 *  from `public/images/event-art/<event>-<nn>-<hero|decor>.webp`. Templates without a file keep the vector motif. */
const available: Record<string, { hero: number[]; decor: number[] }> = {
  tushoo: { hero: range(1, 10), decor: range(1, 10) },
  anniversary: { hero: [1, 2, 3, 4, 6, 7], decor: range(1, 8) },
  beshik: { hero: range(1, 10), decor: range(1, 10) },
  birthday: { hero: range(1, 10), decor: range(1, 10) },
  bachelorette: { hero: range(1, 10), decor: range(1, 10) },
  corporate: { hero: range(1, 10), decor: range(1, 10) },
  iftar: { hero: range(1, 10), decor: range(1, 10) },
};

function range(from: number, to: number) { return Array.from({ length: to - from + 1 }, (_, i) => from + i); }

export function eventArt(designId: string): { hero?: string; decor?: string } {
  const design = collectionDesigns.find(item => item.id === designId);
  const list = design && available[design.event];
  if (!design || !list) return {};
  const n = collectionDesigns.filter(item => item.event === design.event).findIndex(item => item.id === designId) + 1;
  const file = (kind: 'hero' | 'decor') => `/images/event-art/${design.event}-${String(n).padStart(2, '0')}-${kind}.webp`;
  return { ...(list.hero.includes(n) ? { hero: file('hero') } : {}), ...(list.decor.includes(n) ? { decor: file('decor') } : {}) };
}
