"use client";

import type { Invitation } from '@/lib/types';
import type { EventPresentation } from '@/lib/eventPresentation';
import { WeddingPart } from './WeddingEditor';
import { CollectionArt } from './CollectionArt';
import css from './EventCollection.module.css';

export function EventArtwork({ theme }: { theme: EventPresentation }) {
  return <div className={css.artwork} aria-hidden="true"><div className={css.orbit}/><CollectionArt motif={theme.motif}/></div>;
}

export function EventCollectionHero({ invitation, theme, locale }: { invitation: Invitation; theme: EventPresentation; locale: string }) {
  const ru = locale === 'ru';
  const [year, month, day] = invitation.date.split('-');
  return <header className={css.hero} data-event-hero={theme.layout}>
    <WeddingPart id="hero-kicker" kind="text" label="Название события" fallback={ru ? 'Тушоо той' : 'Тушоо той'} className={css.kicker}/>
    <div className={css.visual}>
      <WeddingPart id="photo-hero" kind="image" slot="hero" label="Фотография ребёнка" fallback={theme.hero} className={css.heroMedia}>
        <EventArtwork theme={theme}/>
      </WeddingPart>
    </div>
    <div className={css.copy}>
      <WeddingPart id="names" kind="text" field="names" label="Имя ребёнка" fallback="Айлин" className={css.name}/>
      <WeddingPart id="hero-note" kind="text" label="Подпись обложки" fallback={ru ? 'Маленькие шаги. Большое счастье.' : 'Кичинекей кадам. Чоң бакыт.'} className={css.note}/>
    </div>
    <WeddingPart id="event-date" kind="date" label="Дата и время" className={css.date}>
      <span>{[day, month, year].filter(Boolean).join('.')}</span><small>{invitation.time}</small>
    </WeddingPart>
    <WeddingPart id="hero-greeting" kind="text" label="Приветствие" fallback={ru ? 'Разделите с нами радость первых шагов' : 'Алгачкы кадамдын кубанычын бирге бөлүшөлү'} className={css.greeting}/>
  </header>;
}
