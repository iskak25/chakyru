"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDown, Baby, Camera, Footprints, Heart, MapPin, Sparkles, Utensils } from "lucide-react";
import type { Invitation } from "@/lib/types";
import type { PinterestDesign } from "@/lib/pinterestTemplates";
import { safeWeddingLink, weddingStyle, type WeddingPartInfo } from "@/lib/weddingEditor";
import { WeddingEditor, WeddingPart } from "./WeddingEditor";
import { PinterestCalendar, PinterestTimer } from "./PinterestInvite";
import type { InvitePatch } from "./CanvasEdit";
import css from "./FamilySiteInvite.module.css";

type Props = { invitation:Invitation; design:PinterestDesign; locale:string; onChange?:InvitePatch; selected?:string|null; onSelect?:(id:string|null)=>void; onPartsChange?:(parts:WeddingPartInfo[])=>void; startOpen?:boolean };
function scheduleTime(time:string, offset:number) {
  const [h,m]=time.split(":").map(Number);
  const value=((Number.isFinite(h)?h:12)*60+(Number.isFinite(m)?m:0)+offset)%1440;
  return `${String(Math.floor(value/60)).padStart(2,"0")}:${String(value%60).padStart(2,"0")}`;
}

export function FamilySiteInvite({invitation:inv,design,locale,onChange,selected,onSelect,onPartsChange,startOpen}:Props) {
  const [expanded,setExpanded]=useState(false);
  const [reply,setReply]=useState<"idle"|"sending"|"sent"|"error">("idle");
  const detailsId=useId();
  const steps=design.eventType==="tushoo", ky=locale==="ky";
  const tr=(ru:string,kyrgyz:string)=>ky?kyrgyz:ru;
  const opened=!!onChange||!!startOpen||expanded;
  const preview=inv.id==="demo"||inv.id.startsWith("preview");
  const date=new Date(`${inv.date}T12:00:00`);
  const formatted=Number.isNaN(date.getTime())?inv.date:date.toLocaleDateString(ky?"ky-KG":"ru-RU",{day:"numeric",month:"long",year:"numeric"});
  const event=steps?"Тушоо той":"Жентек той";
  const Mark=steps?Footprints:Baby;
  const text=(id:string,fallback:string,className="",field?:WeddingPartInfo["field"]) => <WeddingPart id={id} label={fallback || id} kind="text" fallback={fallback} className={className} field={field}/>;
  const section=(id:string,label:string,children:ReactNode,className="") => <WeddingPart id={`section-${id}`} label={label} kind="block" className={`${css.section} ${className}`}>{children}</WeddingPart>;
  const title=(id:string,value:string)=>text(`${id}-title`,value,css.title);
  const mapHref=safeWeddingLink(inv.mapUrl||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${inv.venue} ${inv.address} ${inv.city}`)}`);
  const program=[
    {offset:0,title:tr("Встреча родных и друзей","Конокторду тосуу"),note:tr("Объятия и радость встречи","Жакындарыбыз менен жылуу жолугушуу"),Icon:Heart},
    {offset:30,title:steps?tr("Первые шаги","Тушоо кесүү"):tr("Знакомство с малышом","Бөбөк менен таанышуу"),note:steps?tr("Тушоо кесүү и добрые пожелания","Алгачкы кадамдар, ак тилектер"):tr("Добрые слова для нашей семьи","Үй-бүлөбүзгө жылуу каалоолор"),Icon:Mark},
    {offset:60,title:tr("Бата и праздничный стол","Бата берүү, ак дасторкон"),note:tr("Благословение старших и семейный обед","Улуулардын батасы, үй-бүлөлүк той"),Icon:Utensils},
    {offset:120,title:tr("Моменты на память","Эстеликке сүрөт"),note:tr("Семейные фотографии и поздравления","Жакындар менен сүрөткө түшүү"),Icon:Camera},
  ];

  return <div className={`${css.root} ${steps?css.garden:css.cradle}`} data-pinterest-design={design.key} data-family-site={design.eventType} style={{"--family-paper":inv.blockColors?.page||design.paper,"--family-ink":design.ink,"--family-accent":design.accent} as CSSProperties}>
    <WeddingEditor key={design.key} invitation={inv} onChange={onChange} selected={selected} onSelect={onSelect} onPartsChange={onPartsChange} locale={locale}>
      <div className={css.stage} onPointerMove={e=>{
        if(onChange||e.pointerType!=="mouse"||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
        const box=e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--tilt-x",`${(0.5-(e.clientY-box.top)/box.height)*5}deg`);
        e.currentTarget.style.setProperty("--tilt-y",`${((e.clientX-box.left)/box.width-0.5)*6}deg`);
      }} onPointerLeave={e=>{e.currentTarget.style.setProperty("--tilt-x","0deg");e.currentTarget.style.setProperty("--tilt-y","0deg");}}>
        <div className={css.tilt}>{section("hero","Обложка",<>
          <WeddingPart id="photo-hero" label="Иллюстрация обложки" kind="image" slot="hero" crop={design.photos.hero} fallback={design.photos.hero.source} className={css.heroImage}/>
          <div className={css.heroCopy}>
            {text("hero-overline",tr("МАЛЕНЬКОЕ СЧАСТЬЕ НАШЕЙ СЕМЬИ","ҮЙ-БҮЛӨБҮЗДҮН КИЧИНЕКЕЙ БАКТЫСЫ"),css.overline)}
            {text("hero-event",event,css.event)}
            <WeddingPart id="names" label="Имя ребёнка" kind="text" field="names" fallback={design.names} className={css.childName}/>
            <WeddingPart id="event-date" label="Дата и время праздника" kind="date" className={css.heroDate}>{formatted} · {inv.time}</WeddingPart>
          </div>
          <WeddingPart id="hero-medallion" label="Объёмный медальон" kind="decoration" className={css.medallion}><Mark aria-hidden="true" strokeWidth={1.3}/></WeddingPart>
        </>,css.hero)}</div>
      </div>
      {!onChange?<button className={css.openButton} type="button" aria-expanded={opened} aria-controls={detailsId} onClick={()=>{setExpanded(true);window.setTimeout(()=>document.getElementById(detailsId)?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"}),40);}}>{text("open-label",tr("Открыть приглашение","Чакырууну ачуу"))}<ArrowDown size={16}/></button>:null}
      <div id={detailsId} hidden={!opened} className={css.details}>
        {section("intro","Приглашение и родители",<>
          {text("intro-overline",tr("НАШЕ СЕМЕЙНОЕ СОБЫТИЕ","ҮЙ-БҮЛӨБҮЗДҮН КУБАНЫЧЫ"),css.overline)}
          {text("hero-tagline",steps?tr("Большой мир начинается с маленького шага","Кичинекей кадам — чоң дүйнөгө жол"):tr("Большая любовь в маленьких ладошках","Кичинекей алакандагы чоң бакыт"),css.tagline)}
          {title("intro",tr("Дорогие родные и друзья!","Урматтуу туугандар жана достор!"))}
          {text("message",steps?tr("Приглашаем вас на тушоо той нашего ребёнка. Первые шаги — маленькое чудо и начало большого пути.\n\nРазделите с нами этот счастливый день, подарите малышу добрые пожелания и тёплые улыбки.","Сиздерди балабыздын тушоо тоюна чакырабыз! Алгачкы кадамдарына күбө болуп, ак батаңызды берип, кубанычыбызды тең бөлүшүңүздөр."):tr("В нашей семье появилось маленькое счастье!\n\nПриглашаем вас на жентек той: познакомиться с малышом, собраться за праздничным столом и разделить нашу радость.","Үй-бүлөбүзгө кичинекей бакыт келди!\n\nСиздерди балабыздын жентек тоюна келип, ак дасторкон үстүндө батаңызды берип, төрүбүздүн кадырлуу коногу болууга чакырабыз!"),css.body,"message")}
          {text("parents-label",tr("С любовью, родители","Урматтоо менен, той ээлери"),css.caption)}
          {text("parents-names","Айдана & Нурбек",css.parents)}
        </>,css.intro)}
        {section("calendar","Календарь",<>{title("calendar",tr("Наш счастливый день","Биздин бактылуу күн"))}<PinterestCalendar invitation={inv} locale={locale}/><WeddingPart id="calendar-time" label="Время начала" kind="date" className={css.arrival}>{tr("Начало в","Башталышы")} {inv.time}</WeddingPart></>,css.calendar)}
        {section("countdown","Обратный отсчёт",<>{text("countdown-label",tr("ДО НАШЕЙ ВСТРЕЧИ","ЖОЛУГУШУУГА ЧЕЙИН"),css.overline)}<PinterestTimer invitation={inv} locale={locale}/></>,css.countdown)}
        {section("program","Программа праздника",<>{title("program",tr("Моменты счастья","Кубанычтуу көз ирмемдер"))}<div className={css.timeline}>{program.map(({offset,title:label,note,Icon},i)=><WeddingPart key={i} id={`program-row-${i}`} label={`Программа: ${label}`} kind="block" className={css.programRow}><WeddingPart id={`program-icon-${i}`} label="Иконка программы" kind="decoration" className={css.programIcon}><Icon strokeWidth={1.3}/></WeddingPart><div>{text(`program-time-${i}`,scheduleTime(inv.time,offset),css.programTime)}{text(`program-title-${i}`,label,css.programTitle)}{text(`program-note-${i}`,note,css.caption)}</div></WeddingPart>)}</div></>)}
        {section("location","Место праздника",<><MapPin className={css.locationIcon} strokeWidth={1.2}/>{text("location-overline",tr("ВСТРЕЧАЕМСЯ ЗДЕСЬ","УШУЛ ЖЕРДЕ ЖОЛУГАБЫЗ"),css.overline)}{text("venue",design.venue,css.venue,"venue")}{text("address",design.address,css.body,"address")}<WeddingPart id="map-button" label="Карта" kind="widget"><a className={css.button} href={mapHref} target="_blank" rel="noopener noreferrer" onClick={e=>{if(onChange)e.preventDefault();}}><MapPin size={16}/>{text("map-label",tr("Открыть карту","Картаны ачуу"))}</a></WeddingPart></>,css.location)}
        {section("wishes","Пожелания гостям",<><Sparkles className={css.locationIcon} strokeWidth={1.2}/>{title("wishes",tr("Самое важное — вы рядом","Эң башкысы — сиздердин келгениңиздер"))}{text("wishes-copy",tr("Приходите всей семьёй! Детским улыбкам мы особенно рады.\n\nЕсли вам нужен детский стульчик или есть пожелания по меню, напишите об этом в ответе ниже.","Үй-бүлөңүздөр менен келиңиздер! Балдардын күлкүсү майрамыбызды көркүнө чыгарат.\n\nБалдар үчүн отургуч же тамак-аш боюнча каалоолоруңуз болсо, төмөндөгү жоопко жазыңыздар."),css.body)}</>,css.wishes)}
        {section("rsvp","Ответ гостя",<>{text("rsvp-overline",tr("БУДЕМ ВАС ЖДАТЬ","СИЗДЕРДИ КҮТӨБҮЗ"),css.overline)}{title("rsvp",tr("Придёте на наш праздник?","Тоюбузга келесизби?"))}{text("rsvp-intro",tr("Подтвердите участие — мы приготовим место для каждого.","Келериңизди билдирип коюңуз — ар бир конокко орун даярдайбыз."),css.body)}
          <form className={css.form} onSubmit={async e=>{
            e.preventDefault();if(onChange||reply==="sending"||reply==="sent")return;
            const data=new FormData(e.currentTarget),name=String(data.get("name")||"").trim();if(!name)return;
            if(preview){setReply("sent");return;}
            setReply("sending");
            try {const result=await fetch(`/api/invitations/${encodeURIComponent(inv.id)}/rsvp`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,rsvp:String(data.get("attendance")||"yes"),plusOne:Math.min(19,Math.max(0,Number(data.get("guests")||1)-1)),note:String(data.get("note")||"")})});if(!result.ok)throw Error("send");setReply("sent");}catch{setReply("error");}
          }}>
            <label>{text("rsvp-name-label",tr("Ваше имя","Атыңыз"),css.formLabel)}<WeddingPart id="rsvp-name" label="Поле имени" kind="widget" fallback={tr("Имя и фамилия","Аты-жөнүңүз")}><input name="name" aria-label={tr("Имя гостя","Коноктун аты")} required autoComplete="name" maxLength={120} placeholder={weddingStyle(inv,"rsvp-name","placeholder")||tr("Имя и фамилия","Аты-жөнүңүз")}/></WeddingPart></label>
            <WeddingPart id="rsvp-attendance" label="Присутствие" kind="widget"><fieldset><legend>{text("attendance-label",tr("Подтверждение участия","Катышууну ырастоо"),css.formLabel)}</legend>{["yes","no"].map((value,i)=><label key={value} className={css.radio}><input name="attendance" type="radio" value={value} defaultChecked={i===0}/>{text(`attendance-${value}`,i===0?tr("С радостью придём","Кубаныч менен келебиз"):tr("К сожалению, не сможем","Тилекке каршы, келе албайбыз"))}</label>)}</fieldset></WeddingPart>
            <label>{text("guests-label",tr("Всего гостей, включая детей и вас","Балдар менен кошо жалпы коноктордун саны"),css.formLabel)}<WeddingPart id="rsvp-guests" label="Количество гостей" kind="widget"><input name="guests" aria-label={tr("Количество гостей","Коноктордун саны")} type="number" min="1" max="20" defaultValue="1" required/></WeddingPart></label>
            <label>{text("note-label",tr("Дети и пожелания по меню","Балдар жана тамак-аш боюнча каалоолор"),css.formLabel)}<WeddingPart id="rsvp-note" label="Пожелания семьи" kind="widget" fallback={tr("Возраст детей, нужен ли детский стульчик…","Балдардын жашы, отургуч керекпи…")}><textarea name="note" aria-label={tr("Пожелания","Каалоолор")} rows={3} maxLength={2000} placeholder={weddingStyle(inv,"rsvp-note","placeholder")||tr("Возраст детей, нужен ли детский стульчик…","Балдардын жашы, отургуч керекпи…")}/></WeddingPart></label>
            <WeddingPart id="rsvp-submit" label="Отправить ответ" kind="widget"><button type="submit" className={css.button} disabled={!!onChange||reply==="sending"||reply==="sent"}>{text("submit-label",tr("Отправить ответ","Жоопту жөнөтүү"))}</button></WeddingPart>
            {reply==="sent"?<p role="status">{preview?tr("Это предпросмотр. Ответ не отправлен.","Бул алдын ала көрүү. Жооп жөнөтүлгөн жок."):tr("Спасибо! Ваш ответ отправлен.","Рахмат! Жообуңуз жөнөтүлдү.")}</p>:null}
            {reply==="error"?<p role="alert">{tr("Не удалось отправить ответ. Попробуйте ещё раз.","Жооп жөнөтүлгөн жок. Кайра аракет кылыңыз.")}</p>:null}
          </form>
        </>)}
        {section("footer","Завершение",<><Heart className={css.footerHeart} fill="currentColor" strokeWidth={0}/><div className={css.farewell}>{text("footer-heading",tr("До встречи на нашем празднике!","Тоюбузда жолугушканча!"),css.title)}<WeddingPart id="footer-names" label="Имя ребёнка внизу" kind="text" field="names" fallback={design.names} className={css.parents}/>{text("footer-event",event,css.caption)}</div></>,css.footer)}
      </div>
    </WeddingEditor>
  </div>;
}
