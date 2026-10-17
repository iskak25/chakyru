"use client";

import type { CSSProperties } from 'react';
import type { Invitation } from '@/lib/types';
import { eventExamples } from '@/lib/collectionTemplates';
import type { EventPresentation } from '@/lib/eventPresentation';
import { WeddingPart } from './WeddingEditor';
import { CollectionArt } from './CollectionArt';
import css from './EventCollection.module.css';

const notes: Record<string, [string, string]> = {
  tushoo: ['Алгачкы кадам — чоң дүйнөгө жол', 'Маленькие шаги в большой мир'],
  anniversary: ['Өмүрдүн эң сонун белестери', 'Прекрасный повод быть вместе'],
  beshik: ['Ак бешик, ак тилек, ак бата', 'Колыбель, наполненная любовью'],
  birthday: ['Бул күн кубанычка толсун', 'День, наполненный счастьем'],
  jentek: ['Кичинекей бакыт, чоң сүйүү', 'Маленькое счастье. Большая любовь.'],
  bachelorette: ['Сүйүктүү курбулар менен бир кеч', 'Особенный вечер в кругу подруг'],
  corporate: ['Ийгиликтерди бирге белгилейли', 'Вечер в честь наших общих успехов'],
  iftar: ['Берекелүү дасторконго кош келиңиз', 'Тепло встречи. Свет добрых пожеланий.'],
};

export function EventArtwork({ theme }: { theme: EventPresentation }) {
  return <div className={css.artwork} aria-hidden="true"><div className={css.orbit}/><CollectionArt motif={theme.motif}/></div>;
}

export function EventCollectionHero({ invitation, theme, locale }: { invitation: Invitation; theme: EventPresentation; locale: string }) {
  const ru = locale === 'ru';
  const example = eventExamples[theme.event];
  const [year, month, day] = invitation.date.split('-');
  return <header className={css.hero} data-event-hero={theme.layout}>
    <div className={css.frame} aria-hidden="true"/>
    <div className={css.sparkles} aria-hidden="true">{Array.from({length: 9}, (_, i) => <i key={i} style={{'--i': i, left: `${8 + (i * 37 % 85)}%`, top: `${7 + (i * 19 % 80)}%`} as CSSProperties}/>)}</div>
    <div className={css.crest} aria-hidden="true"><span/><CollectionArt motif={theme.event === 'iftar' ? 'moon' : theme.motif}/><span/></div>
    <WeddingPart id="hero-kicker" kind="text" label="Название события" fallback={example.title[ru ? 1 : 0]} className={css.kicker}/>
    <div className={css.copy}>
      {theme.event === 'anniversary' ? <WeddingPart id="collection-age" kind="text" label="Возраст юбиляра" fallback="60" className={css.age}/> : null}
      <WeddingPart id="names" kind="text" field="names" label="Имя или название" fallback={example.names} className={css.name}/>
      <WeddingPart id="hero-note" kind="text" label="Подпись обложки" fallback={notes[theme.event]?.[ru ? 1 : 0] ?? ''} className={css.note}/>
    </div>
    <div className={css.visual} data-user-photo={Boolean(invitation.gallery?.hero) || undefined}>
      <div className={css.halo} aria-hidden="true"/>
      <WeddingPart id="photo-hero" kind="image" slot="hero" label="Изображение обложки" fallback={theme.hero} className={css.heroMedia}>
        <EventArtwork theme={theme}/>
      </WeddingPart>
    </div>
    <WeddingPart id="event-date" kind="date" label="Дата и время" className={css.date}>
      <span>{day || '—'}</span><span>{month || '—'}<small>{year}</small></span><span>{invitation.time}</span>
    </WeddingPart>
    <WeddingPart id="hero-greeting" kind="text" label="Приветствие" fallback={ru ? 'С радостью ждём вас' : 'Кубанычыбызды бирге бөлүшөлү'} className={css.greeting}/>
    <WeddingPart id="hero-venue" kind="text" field="venue" label="Место проведения" fallback={invitation.venue} className={css.heroVenue}/>
    <div className={css.decor} aria-hidden="true">{theme.decor ? <img src={theme.decor} alt="" loading="lazy"/> : <CollectionArt motif={theme.motif}/>}</div>
    <span className={css.scrollMark} aria-hidden="true">↓</span>
  </header>;
}
