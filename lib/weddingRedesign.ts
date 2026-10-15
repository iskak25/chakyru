/** Wedding collection: one art direction per catalogue id, built from the 14 reference screenshots. */
export const weddingRedesign = {
  'olive-vow': { theme: 'w-veil', photo: 'wedding-olive-vow', order: 'intro,calendar,location,programme', decor: '', venue: 'sage-footer', paper: '#f6f3e9', ink: '#465738' },
  'peony-arch': { theme: 'w-toile', photo: 'wedding-peony-arch', order: 'intro,calendar,programme,location', decor: '', venue: 'winter-venue', paper: '#fcf9f2', ink: '#24496c' },
  'silk-letter': { theme: 'w-lace', photo: 'wedding-silk-letter', order: 'intro,calendar,programme,location', decor: '', venue: 'tuscany-hotel', paper: '#f5f8fa', ink: '#345a70' },
  'night-orbit': { theme: 'w-curtain', photo: 'wedding-night-orbit', order: 'intro,location,calendar,programme', decor: '', venue: 'rose-venue', paper: '#f7f3e9', ink: '#233650' },
  'tunduk-union': { theme: 'w-torn', photo: 'wedding-tunduk-union', order: 'intro,calendar,location,programme', decor: '', venue: 'tuscany-villa', paper: '#fbf5e9', ink: '#725332' },
  'lily-gate': { theme: 'w-arch', photo: 'wedding-lily-gate', order: 'intro,programme,calendar,location', decor: '', venue: 'tuscany-villa', paper: '#faf8ef', ink: '#596345' },
  'our-pictures': { theme: 'w-leaf', photo: 'wedding-our-pictures', order: 'intro,programme,location,calendar', decor: '', venue: 'mountains-venue', paper: '#fbfaf6', ink: '#38483c' },
  'mountain-vow': { theme: 'w-wine', photo: 'wedding-mountain-vow', order: 'intro,calendar,programme,location', decor: '', venue: 'burgundy-venue', paper: '#f4f7f6', ink: '#3c5862' },
  'rose-seal': { theme: 'w-mono', photo: 'wedding-rose-seal', order: 'intro,calendar,programme,location', decor: '', venue: 'rose-venue', paper: '#fbf2ef', ink: '#732e40' },
  'fern-window': { theme: 'w-silk', photo: 'wedding-fern-window', order: 'intro,programme,calendar,location', decor: '', venue: 'burgundy-venue', paper: '#f2f5ed', ink: '#3e5844' },
  'type-love': { theme: 'w-pearl', photo: 'wedding-type-love', order: 'intro,calendar,location,programme', decor: '', venue: 'sage-footer', paper: '#faf8f2', ink: '#333333' },
  'swallow-post': { theme: 'w-blossom', photo: 'wedding-swallow-post', order: 'intro,programme,calendar,location', decor: '', venue: 'rose-venue', paper: '#f3f7fa', ink: '#3c6176' },
  'garden-terrace': { theme: 'w-satin', photo: 'wedding-garden-terrace', order: 'intro,calendar,location,programme', decor: '', venue: 'winter-venue', paper: '#fbf4f0', ink: '#79524e' },
  'lotus-fold': { theme: 'w-frame', photo: 'wedding-lotus-fold', order: 'intro,calendar,programme,location', decor: '', venue: 'tuscany-villa', paper: '#f7f3fa', ink: '#655078' },
} as const;
export type WeddingSlug = keyof typeof weddingRedesign;
import { eventRedesign } from './eventRedesign';
type WeddingDir = Omit<(typeof weddingRedesign)[WeddingSlug], 'photo' | 'decor' | 'paper' | 'ink'> & { photo: string; decor: string; paper: string; ink: string };
const byTheme = Object.fromEntries(Object.values(weddingRedesign).map(v => [v.theme, v]));
/** Art direction for a wedding id, or for any other event id that borrows a wedding composition (empty photo/decor/colours = use the design's own). */
export function weddingDirection(id: string): WeddingDir | undefined {
  const own = weddingRedesign[id.replace('collection-wedding-', '') as WeddingSlug];
  if (own) return own;
  const base = byTheme[eventRedesign[id]];
  return base ? { ...base, photo: '', decor: '', paper: '', ink: '' } : undefined;
}
