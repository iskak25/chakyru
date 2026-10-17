import { collectionDesigns, type CollectionEvent, type Motif } from './collectionTemplates';
import { eventArt } from './eventArt';
import { eventRedesign } from './eventRedesign';

export type EventPresentation = {
  family: 'soft' | 'editorial' | 'botanical' | 'heritage' | 'gala' | 'nocturne' | 'ribbon';
  layout: 'poster' | 'arch' | 'ticket' | 'medallion' | 'album' | 'letter' | 'canopy' | 'stage';
  event: CollectionEvent;
  motif: Motif;
  paper: string;
  ink: string;
  accent: string;
  wash: string;
  hero?: string;
  decor?: string;
};

const families: Partial<Record<CollectionEvent, EventPresentation['family']>> = {
  tushoo: 'heritage', anniversary: 'editorial', beshik: 'soft', birthday: 'gala',
  jentek: 'botanical', bachelorette: 'ribbon', corporate: 'gala', iftar: 'nocturne',
};
const layouts: Record<string, EventPresentation['layout']> = {
  arch: 'arch', gate: 'canopy', window: 'arch', orbit: 'medallion', medallion: 'medallion',
  ticket: 'ticket', letter: 'letter', postcard: 'letter', collage: 'album', duet: 'album',
  type: 'poster', banner: 'stage', crest: 'stage', ribbon: 'canopy', quilt: 'canopy',
  botanical: 'arch', frame: 'album', columns: 'poster', fold: 'letter', terrace: 'stage',
  landscape: 'stage', stairs: 'poster',
};

/** Event-only direction; weddings and kyz keep their dedicated renderer. */
export const eventPresentations: Record<string, EventPresentation> = Object.fromEntries(
  collectionDesigns.filter(d => Object.hasOwn(eventRedesign, d.id)).map(d => {
    const art = eventArt(d.id);
    return [d.id, {
      event: d.event, family: families[d.event] ?? 'soft', layout: layouts[d.composition] ?? 'arch',
      motif: d.motif, paper: d.paper, ink: d.ink, accent: d.accent, wash: d.wash,
      hero: art.hero ?? d.photo, decor: art.decor,
    } satisfies EventPresentation];
  }),
);

export function eventPresentation(id: string) { return eventPresentations[id]; }

/** A missing asset stays missing; never manufacture an empty .webp URL. */
export function eventMediaSource(value?: string, fallback?: string) {
  return value?.trim() || fallback?.trim() || undefined;
}
