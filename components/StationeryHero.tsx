"use client";

import type { Invitation } from '@/lib/types';
import { eventExamples } from '@/lib/collectionTemplates';
import type { EventPresentation } from '@/lib/eventPresentation';
import { WeddingPart } from './WeddingEditor';
import { CollectionArt } from './CollectionArt';
import css from './StationeryCollection.module.css';

export function stationeryMood(theme: EventPresentation) {
  if (theme.event === 'iftar') return 'arch';
  if (theme.event === 'corporate' || theme.event === 'anniversary') return 'silk';
  if (theme.event === 'tushoo' && ['steps', 'kite', 'sun'].includes(theme.motif)) return 'heritage';
  if (theme.event === 'beshik' && ['cradle', 'ornament'].includes(theme.motif)) return 'heritage';
  return 'floral';
}

export function StationeryHero({ invitation: inv, theme, locale }: { invitation: Invitation; theme: EventPresentation; locale: string }) {
  const ru = locale === 'ru';
  const example = eventExamples[theme.event];
  const [year, month, day] = inv.date.split('-');
  const months = ru ? ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'] : ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
  const mood = stationeryMood(theme);
  const album = ['album', 'editorial', 'ticket'].includes(theme.layout);
  return <header className={css.hero} data-event-hero={theme.layout} data-cover={album ? 'album' : mood}>
    <div className={css.topOrnament} aria-hidden="true"><CollectionArt motif={mood === 'heritage' ? 'ornament' : mood === 'arch' ? 'moon' : 'olive'}/></div>
    <WeddingPart id="hero-kicker" kind="text" label="Название события" fallback={example.title[ru ? 1 : 0]} className={css.kicker}/>
    <WeddingPart id="names" kind="text" field="names" label="Имя или название" fallback={example.names} className={css.names}/>
    {theme.event === 'anniversary' && <WeddingPart id="collection-age" kind="text" label="Возраст юбиляра" fallback="60" className={css.age}/>}
    <WeddingPart id="hero-note" kind="text" label="Подпись обложки" fallback={ru ? 'Приглашаем разделить нашу радость' : 'Кубанычыбызды бирге бөлүшөлү'} className={css.note}/>
    <div className={css.picture} data-photo={Boolean(inv.gallery?.hero) || undefined}>
      <WeddingPart id="photo-hero" kind="image" slot="hero" label="Изображение обложки" fallback={theme.hero} className={css.heroMedia}>
        <CollectionArt motif={theme.motif}/>
      </WeddingPart>
    </div>
    <WeddingPart id="hero-greeting" kind="text" label="Приветствие" fallback={ru ? 'Дорогие родные и друзья!' : 'Урматтуу туугандар жана достор!'} className={css.greeting}/>
    <div className={css.rule} aria-hidden="true"><span/>{mood === 'heritage' || mood === 'arch' ? '❖' : '♡'}<span/></div>
    <WeddingPart id="event-date" kind="date" label="Дата и время" className={css.date}>
      <b>{day || '—'}</b><span>{months[Number(month)-1] || '—'}<small>{year}</small></span><span>{inv.time}</span>
    </WeddingPart>
    <WeddingPart id="hero-venue" kind="text" field="venue" label="Место проведения" fallback={inv.venue} className={css.venue}/>
    <span className={css.scroll} aria-hidden="true">↓</span>
  </header>;
}
