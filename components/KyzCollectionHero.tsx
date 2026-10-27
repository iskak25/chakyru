"use client";
import { WeddingPart } from './WeddingEditor';
import { CollectionArt } from './CollectionArt';
import { kyzAsset, kyzDirection } from '@/lib/kyzRedesign';
import type { Invitation } from '@/lib/types';

export function KyzCollectionHero({id, invitation, locale}: {id:string; invitation:Invitation; locale:string}) {
  const d = kyzDirection(id), ru = locale === 'ru';
  const text = (key:string, fallback:string, part:string, field?:'names'|'venue') => <WeddingPart id={key} label={fallback} kind="text" field={field} fallback={fallback} className={`kyz-${part}`} />;
  const name = text('names', 'Айпери', 'name', 'names');
  const title = text('hero-kicker', 'Кыз узатуу', 'title');
  const note = text('hero-note', ru ? 'С любовью к родному дому' : 'Ак бата менен жаңы жолго', 'note');
  const photo = <WeddingPart id="photo-hero" label="Фотография девушки" kind="image" slot="hero" fallback={kyzAsset(d.photo)} className="kyz-photo" />;
  const date = <WeddingPart id="event-date" label="Дата и время" kind="date" className="kyz-date">{invitation.date.split('-').reverse().join(' · ')}<small>{invitation.time}</small></WeddingPart>;
  const venue = text('hero-venue', invitation.venue, 'venue', 'venue');
  // Украшения тоже отдельные блоки редактора (можно выбрать и удалить). Там, где CSS темы позиционирует их
  // абсолютно, обёртка сломала бы раскладку, поэтому они остаются как есть.
  const placed = ['garden','floral','seal','azure'].includes(d.theme);
  const deco = (partId:string, label:string, node:React.ReactNode) => placed ? node : <WeddingPart id={partId} label={label} kind="block">{node}</WeddingPart>;
  const flourish = deco('hero-flourish', 'Орнамент', <div className="kyz-flourish" aria-hidden="true"><CollectionArt motif={['torn','heritage','threshold'].includes(d.theme)?'ornament':'olive'} /></div>);
  const ornament = deco('hero-flowers', 'Цветы', <div className="kyz-flowers" aria-hidden="true" style={{backgroundImage:`url(${kyzAsset(d.decor)})`}} />);
  const satin = deco('hero-satin', 'Шёлк', <div className="kyz-satin"/>);
  const greeting = text('hero-greeting', ru ? 'Дорогие родные\nи близкие!' : 'Урматтуу туугандар,\nкадырлуу коноктор!', 'greeting');
  const monogram = <div className="kyz-monogram" aria-hidden="true">{(invitation.names || 'А').slice(0,1)}</div>;
  let content;
  switch(d.theme) {
    case 'garden': content=<>{photo}<div className="kyz-paper">{greeting}{flourish}{title}{name}{note}{date}{venue}</div>{ornament}</>;break;
    case 'torn': content=<>{photo}<div className="kyz-paper">{greeting}{title}{name}{flourish}{note}{date}{venue}</div></>;break;
    case 'letter': content=<>{photo}<div className="kyz-paper">{title}{name}{note}<div className="kyz-rule"/>{date}</div></>;break;
    case 'theatre': content=<><div className="kyz-curtain"/>{title}{name}{date}{ornament}<div className="kyz-inset">{photo}{note}</div></>;break;
    case 'seal': content=<><div className="kyz-envelope">{title}{name}{note}{date}<div className="kyz-wax" aria-hidden="true"><CollectionArt motif="waxSeal" /></div></div>{ornament}{photo}</>;break;
    case 'floral': content=<>{ornament}{title}<div className="kyz-oval">{photo}</div>{name}{note}{flourish}{date}</>;break;
    case 'mirror': content=<>{title}<div className="kyz-mirror">{name}{note}{date}</div>{ornament}{photo}</>;break;
    case 'threshold': content=<>{photo}<div className="kyz-paper">{title}{name}{flourish}{note}{date}</div></>;break;
    case 'azure': content=<><div className="kyz-blue">{title}{name}{photo}{monogram}</div>{date}{note}{flourish}</>;break;
    case 'cameo': content=<>{title}{name}{date}<div className="kyz-mirror">{photo}</div>{ornament}{note}</>;break;
    case 'sapphire': content=<>{photo}{satin}{greeting}{name}{title}{ornament}{date}</>;break;
    case 'moon': content=<>{title}<div className="kyz-orbit">{photo}<span aria-hidden="true">✦</span></div>{name}{note}{date}{flourish}</>;break;
    case 'album': content=<>{title}{name}<div className="kyz-camera">{photo}<span aria-hidden="true">◉</span></div><div className="kyz-disco" aria-hidden="true"/>{note}{date}</>;break;
    case 'ice': content=<>{ornament}{title}<div className="kyz-arch">{photo}</div>{name}{note}{date}</>;break;
    case 'landscape': content=<>{title}{name}<div className="kyz-landscape">{photo}{ornament}</div>{note}{date}{venue}</>;break;
    case 'editorial': content=<>{title}<div className="kyz-editorial-name">{name}</div><div className="kyz-spread">{photo}<div>{date}{note}{flourish}</div></div>{venue}</>;break;
    case 'postcard': content=<><div className="kyz-stamp">{photo}</div>{title}{greeting}{name}{note}<div className="kyz-rule"/>{date}{ornament}</>;break;
    case 'olive': content=<>{title}{name}{photo}{satin}{ornament}{note}{date}</>;break;
    case 'heritage': content=<><div className="kyz-heritage-border">{title}{photo}{name}{date}</div>{flourish}{note}</>;break;
    case 'heart': content=<>{title}{name}<div className="kyz-heart">{photo}</div>{ornament}{note}{date}</>;break;
    case 'ticket': content=<><div className="kyz-ticket-top">{title}{photo}{name}{note}</div><div className="kyz-ticket-bottom">{date}{venue}{ornament}</div></>;break;
    case 'ribbon': content=<>{photo}<div className="kyz-paper">{title}{name}{note}{date}</div>{satin}{ornament}</>;break;
    case 'petal': content=<>{title}{name}{date}<div className="kyz-wave">{photo}</div>{ornament}{note}</>;break;
    case 'sun': content=<><div className="kyz-sun" aria-hidden="true"/>{title}{name}{note}<div className="kyz-steps">{photo}</div>{date}{ornament}</>;break;
  }
  return <header data-kyz-hero={d.theme}>{content}</header>;
}
