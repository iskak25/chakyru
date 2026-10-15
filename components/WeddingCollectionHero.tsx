"use client";
import { WeddingPart } from './WeddingEditor';
import { CollectionArt } from './CollectionArt';
import { kyzAsset } from '@/lib/kyzRedesign';
import { weddingDirection } from '@/lib/weddingRedesign';
import { collectionDesigns, eventExamples } from '@/lib/collectionTemplates';
import type { Invitation } from '@/lib/types';

/** Cover compositions for the 14 wedding references; every word and photo stays an editor part. */
export function WeddingCollectionHero({ id, invitation, locale }: { id: string; invitation: Invitation; locale: string }) {
  const d = weddingDirection(id);
  if (!d) return null;
  const ru = locale === 'ru';
  const design = collectionDesigns.find(item => item.id === id);
  const example = eventExamples[design?.event ?? 'wedding'];
  const isWedding = !design || design.event === 'wedding';
  const motif = design?.motif ?? 'olive';
  const photoSrc = d.photo ? kyzAsset(d.photo) : design?.photo || '';
  const text = (key: string, fallback: string, part: string, field?: 'names' | 'venue') => <WeddingPart id={key} label={fallback} kind="text" field={field} fallback={fallback} className={`kyz-${part}`} />;
  const title = text('hero-kicker', example.title[ru ? 1 : 0], 'title');
  const name = text('names', example.names, 'name', 'names');
  const note = text('hero-note', ru ? 'Разделите с нами этот день' : 'Кубанычыбызды бирге бөлүшөлү', 'note');
  const greeting = text('hero-greeting', ru ? 'Дорогие родные\nи близкие!' : 'Урматтуу туугандар,\nкадырлуу коноктор!', 'greeting');
  const photo = photoSrc ? <WeddingPart id="photo-hero" label="Фотография" kind="image" slot="hero" fallback={photoSrc} className="kyz-photo" /> : <div className="kyz-photo wd-artbox" aria-hidden="true"><CollectionArt motif={motif} /></div>;
  const [year, month, day] = invitation.date.split('-');
  const date = <WeddingPart id="event-date" label="Дата и время" kind="date" className="kyz-date">{[day, month, year].filter(Boolean).join('.')}<small>{invitation.time}</small></WeddingPart>;
  const bigDate = <WeddingPart id="event-date" label="Дата и время" kind="date" className="wd-bigdate">{day}.{month}<small>{year} · {invitation.time}</small></WeddingPart>;
  const ornament = d.decor ? <div className="kyz-flowers" aria-hidden="true" style={{ backgroundImage: `url(${kyzAsset(d.decor)})` }} /> : <div className="kyz-flowers wd-motifdecor" aria-hidden="true"><CollectionArt motif={motif} /></div>;
  const flourish = <div className="kyz-flourish" aria-hidden="true"><CollectionArt motif={motif} /></div>;
  const initials = (invitation.names || 'Ө & Ү').split(/\s*(?:&|и|жана|\+)\s*/i).map(part => part.trim().slice(0, 1).toUpperCase()).filter(Boolean).slice(0, 2);
  const monogram = <div className="wd-monogram" aria-hidden="true"><span>{initials[0] || 'Ө'}</span><i /><span>{initials[1] || 'Ү'}</span></div>;
  const seal = <div className="wd-seal" aria-hidden="true"><CollectionArt motif="waxSeal" /></div>;
  let content;
  switch (d.theme) {
    case 'w-veil': content = <>{title}<div className="wd-heart">{name}{date}</div>{isWedding && <div className="wd-portrait">{photo}</div>}{ornament}{greeting}</>; break;
    case 'w-toile': content = <><div className="wd-toile" aria-hidden="true" /><div className="wd-oval">{title}{isWedding && <div className="wd-portrait">{photo}</div>}{name}{note}{date}</div>{ornament}</>; break;
    case 'w-lace': content = <><div className="wd-top">{name}{date}</div><div className="wd-lace">{photo}</div></>; break;
    case 'w-curtain': content = <><div className="wd-drape" aria-hidden="true" /><div className="wd-card">{title}{photo}{name}{note}{date}</div>{ornament}</>; break;
    case 'w-torn': content = <><div className="wd-arch">{photo}</div>{title}<div className="wd-paper">{greeting}{name}{date}</div>{ornament}</>; break;
    case 'w-arch': content = <><div className="wd-stone" aria-hidden="true" /><div className="wd-stone-text">{name}{isWedding && <div className="wd-portrait">{photo}</div>}{flourish}{note}{date}</div>{ornament}</>; break;
    case 'w-leaf': content = <>{monogram}{isWedding && <div className="wd-portrait">{photo}</div>}{name}{date}{ornament}</>; break;
    case 'w-wine': content = <>{bigDate}<div className="wd-offset">{photo}</div>{name}{note}</>; break;
    case 'w-mono': content = <><div className="wd-tall">{photo}<div className="wd-over">{name}</div></div>{title}{note}</>; break;
    case 'w-silk': content = <><div className="wd-silkbg" aria-hidden="true" /><div className="wd-silk">{title}{isWedding && <div className="wd-portrait">{photo}</div>}{name}{date}</div></>; break;
    case 'w-pearl': content = <>{title}{photo}{ornament}{greeting}{name}{date}</>; break;
    case 'w-blossom': content = <>{ornament}<div className="wd-frame">{name}</div>{note}{date}<div className="wd-polaroid">{photo}</div></>; break;
    case 'w-satin': content = <><div className="wd-satin" aria-hidden="true" /><div className="wd-mirror">{name}{date}</div>{isWedding && <div className="wd-portrait">{photo}</div>}{seal}{note}</>; break;
    case 'w-frame': content = <>{date}<div className="wd-cameo">{photo}</div>{name}{note}</>; break;
  }
  return <header data-kyz-hero={d.theme}>{content}</header>;
}
