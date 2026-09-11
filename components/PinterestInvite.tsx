"use client";

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import { Heart, MapPin, Volume2, VolumeX } from "lucide-react";
import type { Invitation } from "@/lib/types";
import type { PinterestDesign } from "@/lib/pinterestTemplates";
import { effectiveMusicUrl } from "@/lib/music";
import { safeWeddingLink, weddingStyle, type WeddingPartInfo } from "@/lib/weddingEditor";
import { InviteAudio } from "./InviteAudio";
import { WeddingEditor, WeddingPart } from "./WeddingEditor";
import { invitationText, invitationDateLocale } from "@/lib/inviteTranslations";
import type { InvitePatch } from "./CanvasEdit";
import css from "./PinterestInvite.module.css";

type Props = { invitation: Invitation; design: PinterestDesign; locale: string; onChange?: InvitePatch; selected?: string | null; onSelect?: (id: string | null) => void; onPartsChange?: (parts: WeddingPartInfo[]) => void };
function Copy({ id, text, className = "", field }: { id: string; text: string; className?: string; field?: WeddingPartInfo["field"] }) {
  return <WeddingPart id={id} label={text || id} kind="text" fallback={text} field={field} className={className} />;
}
function eventDate(inv: Invitation) {
  const value = new Date(`${inv.date}T12:00:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}
export function PinterestCalendar({ invitation, locale = "ru" }: { invitation: Invitation; locale?: string }) {
  const date = eventDate(invitation);
  if (!date) return null;
  const offset = (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7;
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return <WeddingPart id="calendar" label="Календарь" kind="date" className={css.calendar}>
    <div className={css.month}>{date.toLocaleDateString(locale === "ky" ? "ky-KG" : "ru-RU", { month:"long", year:"numeric" })}</div>
    <div className={css.days}>{(locale === "ky" ? ["ДҮЙ","ШЕЙ","ШАР","БЕЙ","ЖУМ","ИШЕ","ЖЕК"] : ["ПН","ВТ","СР","ЧТ","ПТ","СБ","ВС"]).map(d => <small key={d}>{d}</small>)}{Array.from({length:offset},(_,i) => <span key={`blank-${i}`} />)}{Array.from({length:days},(_,i) => <span key={i} className={i+1===date.getDate()?css.today:""}>{i+1}</span>)}</div>
  </WeddingPart>;
}
export function PinterestTimer({ invitation, locale = "ky" }: { invitation: Invitation; locale?: string }) {
  const [now,setNow] = useState<number|null>(null);
  useEffect(() => { const timer=setInterval(() => setNow(Date.now()),1000); return () => clearInterval(timer); },[]);
  const target=Date.parse(`${invitation.date}T${invitation.time || "17:00"}:00`);
  const diff=now===null || !Number.isFinite(target)?0:Math.max(0,target-now);
  const values=[Math.floor(diff/86400000),Math.floor(diff/3600000)%24,Math.floor(diff/60000)%60,Math.floor(diff/1000)%60];
  return <WeddingPart id="countdown" label="Обратный отсчёт" kind="date" className={css.timer}>{values.map((v,i)=><div key={i}><strong>{now===null?"—":String(v).padStart(2,"0")}</strong><small>{(locale === "ru" ? ["ДНЕЙ","ЧАСОВ","МИНУТ","СЕКУНД"] : ["КҮН","СААТ","МҮНӨТ","СЕКУНД"])[i]}</small></div>)}</WeddingPart>;
}

export function PinterestInvite({ invitation: inv, design, locale, onChange, selected, onSelect, onPartsChange }: Props) {
  const tr = (value: string) => invitationText(value, locale);
  const key=design.key, photo=design.format==="photo";
  const date=eventDate(inv);
  const dotted=date?.toLocaleDateString(invitationDateLocale(locale)) || inv.date;
  const formId=useId();
  const [formState,setFormState]=useState<"idle"|"sending"|"sent"|"error">("idle");
  const ru=locale === "ru";
  const musicSrc=effectiveMusicUrl(inv.musicUrl, inv.music);
  const [playing,setPlaying]=useState(false);
  const text=(id:string,value:string,className="",field?:WeddingPartInfo["field"]) => <Copy id={id} text={value} className={className} field={field} />;
  const title=(id:string,value:string,script=false) => text(`${id}-title`,value,`${css.title} ${script?css.script:""}`);
  const section=(id:string,children:ReactNode,className="") => <WeddingPart id={`section-${id}`} label={`Блок: ${id}`} kind="block" className={`${css.section} ${className}`}>{children}</WeddingPart>;
  const image=(slot:string,className="",id=`photo-${slot}`) => {
    const crop=design.photos[slot]; if(!crop) return null;
    return <WeddingPart id={id} label={`Фотография: ${slot}`} kind="image" slot={slot} fallback={crop.source} crop={crop} className={`${css.photo} ${className}`} style={{aspectRatio:`${crop.w}/${crop.h}`}} />;
  };
  const name=(className="") => <WeddingPart id="names" label="Имена" kind="text" field="names" fallback={design.names} className={`${css.names} ${className}`} renderText={value => {
    const pair=value.split(/\s*(?:&|\+)\s*/); return pair.length>1?<><span>{pair[0]}</span><i>&</i><span>{pair.slice(1).join(" & ")}</span></>:<span>{value}</span>;
  }} />;
  const datePart=(id="event-date",className="") => <WeddingPart id={id} label="Дата и время" kind="date" className={`${css.date} ${className}`}>{dotted}</WeddingPart>;
  const ornament=(id:string) => <WeddingPart id={id} label="Орнамент" kind="decoration" className={css.ornament}><span aria-hidden="true">❧</span></WeddingPart>;
  const mapHref=safeWeddingLink(inv.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${inv.venue} ${inv.address} ${inv.city}`)}`);
  const map=() => <WeddingPart id="map-button" label="Карта" kind="widget"><a href={mapHref} target="_blank" rel="noopener noreferrer" className={css.button} onClick={e=>{if(onChange)e.preventDefault();}}>{text("map-label",ru?"ПОСМОТРЕТЬ НА КАРТЕ":"КАРТАНЫ КӨРУ")}</a></WeddingPart>;
  const location=() => section("location",<>{title("location",key==="blue"?"LOCATION":ru?"Место проведения":"Мекен-жайымыз",key!=="blue")}{text("venue",design.venue,css.venue,"venue")}{text("address",design.address,css.body,"address")}{map()}</>,css.location);
  const intro=() => section("intro",<>{title("intro",tr("Дорогие родные и друзья!"),key!=="blue")}{ornament("intro-ornament")}{text("message",ru?`Наша дочь ${inv.names} начинает новую главу своей жизни.\n\nПриглашаем вас на её кыз узатуу. Будем рады провести этот счастливый день в кругу близких людей!`:`Кызыбыз ${inv.names} турмуш жолуна аттанууда.\n\nСиздерди кыз узатуу тоюна чакырабыз. Бул бактылуу күндүн кубанычын жакындарыбыз менен бирге бөлүшкүбүз келет!`,css.body,"message")}</>,css.intro);
  const calendar=() => section("calendar",<>{title("date",ru?"Торжество состоится":"Той салтанаты")}{datePart("calendar-date")}<WeddingPart id="event-time" label="Время мероприятия" kind="date" className={css.time}>{tr("Начало в")} {inv.time}</WeddingPart><PinterestCalendar invitation={inv} locale={locale}/></>);
  const countdown=() => section("timer",<>{title("timer",ru?"До торжества осталось:":"Той салтанатына дейін:")}<PinterestTimer invitation={inv} locale={locale}/></>,css.timerSection);
  const program=() => section("program",<>{title("program",key==="blue"?"TIMING":"Той бағдарламасы")}<div className={css.programGrid}>{[ ["18:00","Қонақтарды қарсы алу"],["19:00","Тойдың басталуы"],["20:00","Дастарқанға жайғасу"],["22:00","Шығарып салу"] ].map(([time,label],i)=><WeddingPart id={`program-row-${i}`} label={`Программа ${time}`} kind="block" key={i} className={css.programItem}>{text(`program-time-${i}`,time,css.programTime)}{text(`program-text-${i}`,label,css.programText)}</WeddingPart>)}</div></>,css.program);
  const rsvp=() => section("rsvp",<>{title("rsvp",ru?"Анкета гостя":"Сауалнама",key!=="blue")}{text("rsvp-hint",ru?"Будем рады видеть вас на нашем празднике. Подтвердите, пожалуйста, присутствие.":"Жұбыңызбен келетін болсаңыз, есімдеріңізді бірге жазуыңызды өтінеміз!",css.body)}
    <form id={formId} className={css.form} onSubmit={async e=>{
      e.preventDefault(); if(onChange || formState==="sending") return;
      const data=new FormData(e.currentTarget), name=String(data.get("name")||"").trim(); if(!name)return;
      if(inv.id==="demo" || inv.id.startsWith("preview")){setFormState("sent");return;}
      setFormState("sending");
      const attending=String(data.get("attendance"));
      try { const response=await fetch(`/api/invitations/${encodeURIComponent(inv.id)}/rsvp`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,rsvp:attending==="no"?"no":"yes",plusOne:attending==="couple"?1:0})}); if(!response.ok)throw Error("send");setFormState("sent"); } catch {setFormState("error");}
    }}>
      <label>{text("guest-name-label",ru?"Ваше имя и фамилия":"АТЫ-ЖӨНІҢІЗ",css.formLabel)}<WeddingPart id="guest-name" label="Поле имени" kind="widget" fallback="Имя"><input name="name" aria-label={tr("Имя гостя")} required maxLength={120} autoComplete="name" placeholder={tr(weddingStyle(inv,"guest-name","placeholder") || tr("Ваше имя"))} /></WeddingPart></label>
      <WeddingPart id="guest-attendance" label="Варианты присутствия" kind="widget"><fieldset><legend>{text("attendance-title",ru?"Вы придёте?":"ҚАТЫСУЫҢЫЗ")}</legend>{["yes","couple","no"].map((v,i)=><label key={v} className={css.radio}><input type="radio" name="attendance" value={v} defaultChecked={i===0}/>{text(`attendance-${v}`,(ru?["С радостью приду","Буду с парой","К сожалению, не смогу"]:["КЕЛЕМІН","ЖҰБЫММЕН КЕЛЕМІН","ӨКІНІШКЕ ОРАЙ, КЕЛЕ АЛМАЙМЫН"])[i])}</label>)}</fieldset></WeddingPart>
      <WeddingPart id="guest-submit" label="Кнопка отправки" kind="widget"><button type="submit" disabled={!!onChange || formState==="sending" || formState==="sent"} className={css.button}>{text("submit-label",ru?"ОТПРАВИТЬ ОТВЕТ":"ЖАУАПТЫ ЖІБЕРУ")}</button></WeddingPart>
      {formState==="sent"?<p role="status">{inv.id==="demo" || inv.id.startsWith("preview")?tr("Это предпросмотр. Ответ не отправлен."):tr("Спасибо! Ваш ответ отправлен.")}</p>:null}{formState==="error"?<p role="alert">{tr("Не удалось отправить ответ. Попробуйте ещё раз.")}</p>:null}
    </form>
  </>,css.rsvp);
  let content:ReactNode;
  if(photo){
    content=<div className={`${css.card} ${css[key]}`}>
      {key!=="newspaper"?image("hero",css.cardBackground):null}
      {key==="silkCard"?<>
        {text("save-date","SAVE THE DATE",css.cardOverline)}{ornament("top-divider")}{text("marrying","WIR HEIRATEN!",css.cardMarrying)}<Heart className={css.cardHeart} fill="currentColor"/>{text("message","Bitte haltet euch\ndiesen besonderen Tag\nfür uns frei.",css.cardMessage,"message")}{name()}{ornament("middle-divider")}<WeddingPart id="event-date" label="Дата свадьбы" kind="date" className={css.cardDate}><small>{date?.toLocaleDateString(invitationDateLocale(locale),{weekday:"long"}).toUpperCase()}</small><span>{dotted.replaceAll(".","  |  ")}</span></WeddingPart>{ornament("bottom-divider")}{text("closing","Wir freuen uns auf euch!",css.cardClosing)}
      </>:key==="nikahCard"?<>
        {text("heading","Чакыруу",css.cardHeading)}{text("message","Сезне зур шатлык белән никах\nтантанасына чакырабыз!",css.cardMessage,"message")}<WeddingPart id="event-date" label="Дата никаха" kind="date" className={css.cardDate}>{(date?[String(date.getDate()).padStart(2,"0"),String(date.getMonth()+1).padStart(2,"0"),String(date.getFullYear()).slice(-2)]:[inv.date]).map((part,i)=><span key={i}>{part}</span>)}</WeddingPart><WeddingPart id="event-time" label="Время никаха" kind="date" className={css.cardTime}>{inv.time}</WeddingPart>{text("address",design.address,css.cardAddress,"address")}{name()}
      </>:key==="monoCard"?<>
        {text("heading","WEDDING INVITATION",css.cardHeading)}{name()}<WeddingPart id="event-date" label="Дата свадьбы" kind="date" className={css.cardDate}><small>{date?.toLocaleDateString(invitationDateLocale(locale),{weekday:"long"})}</small><div><strong>{date?.toLocaleDateString(invitationDateLocale(locale),{month:"long"}).toUpperCase()}</strong><b>{date?.getDate()}</b><i>{date?.getFullYear()}</i></div><small>{tr("Начало в")} {inv.time}</small></WeddingPart>{text("venue",design.venue,css.cardVenue,"venue")}{inv.mapUrl?<WeddingPart id="map-button" label="Местоположение" kind="widget" className={css.cardMap}><a href={mapHref} target="_blank" rel="noopener noreferrer" onClick={e=>{if(onChange)e.preventDefault();}}><MapPin/>{text("map-label","LOCATION")}</a></WeddingPart>:null}
      </>:<>
        {text("save-word",ru?"СОХРАНИТЕ":"УШУЛ",css.saveWord)}{text("the-word",ru?"эту":"күндү",css.theWord)}{text("date-word",ru?"ДАТУ":"ЭСТЕҢИЗ",css.dateWord)}{name()}{image("hero",css.newspaperPhoto)}{text("invited","YOU ARE INVITED",css.cardHeading)}{text("message","we would be happy to announce the day we are finally going to become husband and wife. we hope that our joy can be yours as well",css.cardMessage,"message")}<WeddingPart id="event-date" label="Дата свадьбы" kind="date" className={css.cardDate}>{date?.toLocaleDateString(invitationDateLocale(locale),{month:"short",day:"numeric"}).toUpperCase()} | {inv.time}</WeddingPart>{text("address",design.address,css.cardAddress,"address")}
      </>}
    </div>;
  }else if(key==="ethno")content=<>
    {section("hero",<>{image("hero")}{name()}{text("hero-subtitle","QYZ UZATUU",css.heroSubtitle)}{datePart()}</>,css.ethnoHero)}{image("flower",css.cornerFlower)}{intro()}{image("hands")}{countdown()}{calendar()}{section("dress",<>{title("dress","Национальный костюм")}{text("dress-intro","Будем рады, если вы поддержите этнический стиль праздника.",css.body,"dressCode")}{title("women","Примеры женских нарядов")}{image("women")}{title("men","Примеры мужских нарядов")}{image("men")}</>,css.dress)}{location()}{rsvp()}
  </>;
  else if(key==="burgundy")content=<>
    {section("hero",<>{name(css.script)}{text("hero-subtitle","ҚЫЗ ҰЗАТУ",css.heroSubtitle)}{image("hero",css.circleRight)}{datePart()}</>,css.burgundyHero)}{section("portrait",image("bride",css.arch),css.burgundyPortrait)}{intro()}{section("ceremony",<>{image("hat",css.circleRight)}{datePart("ceremony-date")}{image("hands",css.circleLeft)}<WeddingPart id="ceremony-time" label="Время торжества" kind="date" className={css.ceremonyTime}>{inv.time}<small>{tr("Начало торжества")}</small></WeddingPart></>,css.ceremony)}{calendar()}{location()}{section("hosts",<>{title("hosts","Той иелері:",true)}{text("hosts-names","ТАТУ–АЙМАНГҮЛ",css.body)}{image("yurt",css.circleLeft)}</>)}{countdown()}{rsvp()}{section("thanks",text("thanks","КЕЛІҢІЗДЕР, ТОЙЫМЫЗДЫҢ\nҚАДІРЛІ ҚОНАҒЫ БОЛЫҢЫЗДАР!",css.body))}
  </>;
  else if(key==="goldBride")content=<>
    {section("hero",<>{image("hero")}{name(css.script)}{text("hero-subtitle","ҰЯДАН ҰШҚАН КҮН",css.heroSubtitle)}{ornament("hero-ornament")}</>,css.goldHero)}{intro()}{calendar()}{location()}{program()}{countdown()}{rsvp()}{section("hosts",<>{text("thanks","ТОЙДА КЕЗДЕСКЕНШЕ!\nІЗГІ НИЕТПЕН, ТОЙ ИЕЛЕРІ:",css.body)}{text("hosts-names","Жомарт – Сәуле",css.script)}</>)}{image("footer",css.arch)}
  </>;
  else if(key==="pearl")content=<>
    {section("hero",<>{image("flower",css.pearlFlower)}{name(css.script)}{text("hero-subtitle","QYZ UZATU",css.heroSubtitle)}{datePart()}{image("flower",css.pearlFlower,"photo-flower-bottom")}</>,css.pearlHero)}{intro()}{image("pearls")}{section("hosts",<>{title("hosts","Құрметпен, Той иелері:",true)}{text("hosts-names","ҚАЙЫРГЕЛДІ – ЖАНАРГҮЛ",css.body)}</>)}{calendar()}{location()}{image("pearls","","photo-pearls-second")}{rsvp()}{countdown()}
  </>;
  else content=<>
    {section("hero",<>{text("hero-subtitle","QYZ UZATUU",css.heroSubtitle)}{datePart()}{image("hero")}</>,css.blueHero)}{intro()}{location()}{program()}{section("dress",<>{title("dress","DRESS CODE")}{text("dress-subtitle","Дресс-код",css.subtitle)}{text("dress-description","Пожалуйста, выбирайте наряды в любой понравившейся вам цветовой гамме — главное, чтобы ваш образ был выдержан в элегантном и изысканном стиле.",css.body,"dressCode")}{image("flowers")}</>,css.dark)}{section("details",<>{title("details","DETAILS")}{text("details-subtitle","Пожелания",css.subtitle)}{text("details-gifts","Если хотите подарить нам ценный и нужный подарок, мы будем очень благодарны за вклад в будущую жизнь нашей семьи.",css.body)}{text("details-flowers","Ваше присутствие и тёплые пожелания — лучший подарок для нас.",css.body)}</>,css.dark)}{rsvp()}{countdown()}{section("thanks",<Heart className={css.heart}/>) }
  </>;
  return <div className={`${css.root} ${photo?css.photoRoot:css.siteRoot} ${css[key]}`} style={{"--pin-paper":inv.blockColors?.page || design.paper,"--pin-ink":design.ink,"--pin-accent":design.accent} as CSSProperties} data-pinterest-design={key} data-invitation-card={photo ? "" : undefined}>
    <WeddingEditor key={design.key} invitation={inv} onChange={onChange} selected={selected} onSelect={onSelect} onPartsChange={onPartsChange} locale={locale}>{content}</WeddingEditor>
    {musicSrc ? <>
      <InviteAudio src={musicSrc} playing={playing} />
      <button
        type="button"
        data-export-hide
        onClick={() => setPlaying(p => !p)}
        aria-label={tr(playing ? (ru ? "Выключить музыку" : "Музыканы өчүрүү") : (ru ? "Включить музыку" : "Музыканы күйгүзүү"))}
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition hover:bg-black/45"
      >
        {playing ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </> : null}
  </div>;
}
