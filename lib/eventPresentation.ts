import type { Motif } from './collectionTemplates';

export type EventPresentation = {
  family: 'soft' | 'editorial' | 'botanical' | 'heritage';
  layout: 'poster' | 'arch' | 'ticket' | 'medallion' | 'album' | 'letter';
  motif: Motif;
  paper: string;
  ink: string;
  accent: string;
  wash: string;
  hero?: string;
};

/** Only completed batches opt in. Existing IDs, editor parts and section order remain stable. */
export const eventPresentations: Record<string, EventPresentation> = {
};

export function eventPresentation(id: string) { return eventPresentations[id]; }

/** A missing asset stays missing; never manufacture an empty .webp URL. */
export function eventMediaSource(value?: string, fallback?: string) {
  return value?.trim() || fallback?.trim() || undefined;
}
