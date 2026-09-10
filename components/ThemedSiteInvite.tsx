"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDown, Camera, Gem, Heart, MapPin, Music2, Sparkles, Utensils, Wine } from "lucide-react";
import type { Invitation } from "@/lib/types";
import type { PinterestDesign } from "@/lib/pinterestTemplates";
import { safeWeddingLink, weddingStyle, type WeddingPartInfo } from "@/lib/weddingEditor";
import { WeddingEditor, WeddingPart } from "./WeddingEditor";
import { PinterestCalendar, PinterestTimer } from "./PinterestInvite";
import type { InvitePatch } from "./CanvasEdit";
import css from "./ThemedSiteInvite.module.css";

type Props = { invitation:Invitation; design:PinterestDesign; locale:string; onChange?:InvitePatch; selected?:string|null; onSelect?:(id:string|null)=>void; onPartsChange?:(parts:WeddingPartInfo[])=>void; startOpen?:boolean };
function after(time:string,minutes:number) {
  const [h,m]=time.split(":").map(Number);
  const value=((Number.isFinite(h)?h:18)*60+(Number.isFinite(m)?m:0)+minutes)%1440;
  return `${String(Math.floor(value/60)).padStart(2,"0")}:${String(value%60).padStart(2,"0")}`;
}
export function ThemedSiteInvite({invitation:inv,design,locale,onChange,selected,onSelect,onPartsChange,startOpen}:Props) {
  const [expanded,setExpanded]=useState(false);
  const [reply,setReply]=useState<"idle"|"sending"|"sent"|"error">("idle");
  const detailsId=useId(), formId=useId();
  const opened=!!onChange || !!startOpen || expanded;
  const girls=design.eventType==="bachelorette", glam=design.key==="glam", paper=design.key==="newspaperSite", nikah=design.key==="nikahSite";
  const date=new Date(`${inv.date}T12:00:00`);
  const validDate=!Number.isNaN(date.getTime());
  const formatted=validDate?date.toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}):inv.date;
  const text=(id:string,fallback:string,className="",field?:WeddingPartInfo["field"]) => <WeddingPart id={id} label={fallback || id} kind="text" fallback={fallback} className={className} field={field}/>;
  const section=(id:string,children:ReactNode,className="") => <WeddingPart id={`section-${id}`} label={`Блок: ${id}`} kind="block" className={`${css.section} ${className}`}>{children}</WeddingPart>;
  const title=(id:string,fallback:string) => text(`${id}-title`,fallback,css.title);
  const names=(id="names") => <WeddingPart id={id} label="Имена" kind="text" field="names" fallback={design.names} className={css.names} renderText={value=>{
    const [a,...rest]=value.split(/\s*&\s*/); return <><span>{a}</span>{rest.length?<><i>&</i><span>{rest.join(" & ")}</span></>:null}</>;
  }}/>;
  const picture=(slot:string,className="",id=`photo-${slot}`) => {
    const crop=design.photos[slot]; if(!crop)return null;
    return <WeddingPart id={id} label={`Фото: ${slot}`} kind="image" slot={slot} crop={crop} fallback={crop.source} className={`${css.photo} ${className}`} style={{aspectRatio:`${crop.w}/${crop.h}`}}/>;
  };
  const heading=girls?(glam?"GIRLS NIGHT":"Девичник"):paper?"МЫ ЖЕНИМСЯ":nikah?"Наш никах":"Наша свадьба";
  const swatches=glam?["#151115","#e796b4","#ddc0a1"]:girls?["#efd1d5","#d79aa9","#fff4ef"]:design.key==="silkSite"?["#ede6d5","#b4b79a","#a58446"]:nikah?["#f5f1e9","#ddc8a1","#a58244"]:["#fff","#a9a6a1","#232323"];
  const intro=girls?(glam?"Один вечер. Самые близкие подруги. И повод сиять чуть ярче обычного.\n\nСобираемся на мой девичник: красивые наряды, любимая музыка, фотографии и разговоры до утра.":"Девочки, совсем скоро я скажу «да»!\n\nА пока хочу провести один особенный вечер с вами. Будем смеяться, делиться секретами, поднимать бокалы и создавать воспоминания."):nikah?"С радостью приглашаем вас разделить с нами день нашего никаха.\n\nПусть начало нашей семейной истории будет согрето молитвами, добрыми пожеланиями и присутствием самых близких.":"В нашей истории начинается новая глава.\n\nПриглашаем вас разделить с нами день, когда мы станем семьёй. Будем рады видеть рядом самых дорогих людей.";
  const schedule=girls?[[0,"Собираемся","Объятия и первый тост",Wine],[30,"Ловим момент","Фотографии с подругами",Camera],[60,"Ужин и секреты","Разговоры обо всём на свете",Utensils],[120,"Танцуем!","Наш плейлист и наше настроение",Music2]]:nikah?[[0,"Встреча гостей","Рады видеть каждого из вас",Heart],[30,"Никах","Начало нашей семейной истории",Gem],[60,"Праздничный стол","Тёплые слова и семейный обед",Utensils],[150,"Фотографии","Память об этом светлом дне",Camera]]:[[0,"Встреча гостей","Welcome и первые объятия",Wine],[30,"Церемония","Наше самое важное «да»",Gem],[60,"Праздничный ужин","Поздравления и любимые люди",Utensils],[180,"Танцы под звёздами","Пусть этот вечер запомнится",Music2]];
  const mapHref=safeWeddingLink(inv.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${inv.venue} ${inv.address} ${inv.city}`)}`);

  return <div className={`${css.root} ${css[design.key]}`} data-pinterest-design={design.key} data-themed-site style={{"--theme-paper":inv.blockColors?.page || design.paper,"--theme-ink":design.ink,"--theme-accent":design.accent} as CSSProperties}>
    <WeddingEditor key={design.key} invitation={inv} onChange={onChange} selected={selected} onSelect={onSelect} onPartsChange={onPartsChange} locale={locale}>
      {section("hero",<>
        {picture("hero",css.heroPhoto)}
        <div className={css.heroCopy}>
          {text("hero-overline",girls?"ТОЛЬКО ДЛЯ СВОИХ":"SAVE THE DATE",css.overline)}
          {text("hero-heading",heading,css.heroHeading)}
          {names()}
          {girls?text("hero-tagline",glam?"glam & fabulous":"маленькие секреты · большие эмоции",css.script):null}
          <WeddingPart id="event-date" label="Дата и время события" kind="date" className={css.heroDate}>{formatted}<span>{inv.time}</span></WeddingPart>
          {!onChange?<button type="button" aria-expanded={opened} aria-controls={detailsId} className={css.openButton} data-export-hide onClick={()=>{setExpanded(true);window.setTimeout(()=>document.getElementById(detailsId)?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"}),40);}}>{text("open-label",opened?"К подробностям":"Открыть приглашение")}<ArrowDown size={15}/></button>:null}
        </div>
        <div aria-hidden="true" className={css.floatingHeart}><Heart strokeWidth={1}/></div>
      </>,css.hero)}

      <div id={detailsId} hidden={!opened} className={css.details}>
        {section("intro",<>{text("intro-overline",paper?"СПЕЦИАЛЬНЫЙ ВЫПУСК":girls?"THIS ONE IS FOR THE GIRLS":"ВЫ ПРИГЛАШЕНЫ",css.overline)}{title("intro",girls?"Мои любимые девочки!":paper?"Главная новость этого года":"Дорогие родные и друзья!")}{text("message",intro,css.body,"message")}<WeddingPart id="intro-decoration" label="Декоративное сердце" kind="decoration" className={css.smallHeart}><Heart fill="currentColor" strokeWidth={0}/></WeddingPart></>,css.intro)}
        {section("calendar",<>{title("calendar",girls?"Этот вечер — наш":"Сохраните нашу дату")}<PinterestCalendar invitation={inv}/><WeddingPart id="calendar-time" label="Время начала" kind="date" className={css.arrival}>Начало в {inv.time}</WeddingPart></>,css.calendarSection)}
        {section("countdown",<>{text("timer-label",girls?"ДО НАШЕЙ ВСТРЕЧИ":"ДО СЧАСТЛИВОГО ДНЯ",css.overline)}<PinterestTimer invitation={inv}/></>,css.countdown)}
        {section("location",<>{text("location-overline","МЕСТО ВСТРЕЧИ",css.overline)}{title("location",girls?"Встречаемся здесь":"Место проведения")}{text("venue",design.venue,css.venue,"venue")}{text("address",design.address,css.body,"address")}<WeddingPart id="map-button" label="Кнопка карты" kind="widget"><a href={mapHref} target="_blank" rel="noopener noreferrer" className={css.button} onClick={e=>{if(onChange)e.preventDefault();}}><MapPin size={16}/>{text("map-label","Открыть карту")}</a></WeddingPart>{girls?text("location-note","Если задерживаешься — напиши нам. Мы тебя дождёмся!",css.caption):null}</>,css.location)}
        {section("program",<>{text("program-overline",girls?"ПЛАН НА ВЕЧЕР":"НАШ ДЕНЬ",css.overline)}{title("program",girls?"Немного прекрасного безумия":"Программа торжества")}<div className={css.timeline}>{schedule.map(([offset,label,note,Icon],i)=>{
          const Mark=Icon as typeof Heart;
          return <WeddingPart key={i} id={`program-row-${i}`} label={`Программа: ${label}`} kind="block" className={css.programRow}><WeddingPart id={`program-icon-${i}`} label="Иконка программы" kind="decoration" className={css.programIcon}><Mark strokeWidth={1.25}/></WeddingPart><div>{text(`program-time-${i}`,after(inv.time,Number(offset)),css.programTime)}{text(`program-title-${i}`,String(label),css.programTitle)}{text(`program-description-${i}`,String(note),css.caption)}</div></WeddingPart>;
        })}</div></>,css.program)}
        {section("dress",<>{text("dress-overline","DRESS CODE",css.overline)}{title("dress",girls?(glam?"Сияй. Ты великолепна.":"В оттенках розового"):"Красота в деталях")}{text("dress-description",girls?(glam?"Чёрный, розовый, блеск и немного дерзости. Надевай то, в чём чувствуешь себя великолепно.":"Нежные розовые оттенки, лёгкие ткани и любимые украшения. А главное — твоё хорошее настроение."):nikah?"Будем рады видеть вас в сдержанных, элегантных нарядах светлых и тёплых оттенков.":"Мы будем рады, если вы поддержите цветовую палитру нашего праздника. Выбирайте наряд, в котором вам будет красиво и комфортно.",css.body,"dressCode")}<div className={css.swatches}>{swatches.map((c,i)=><WeddingPart key={i} id={`dress-color-${i}`} label={`Цвет ${i+1}`} kind="block" className={css.swatch} style={{backgroundColor:c}}><span/></WeddingPart>)}</div>{text("dress-note",girls?"Твой лучший аксессуар — улыбка.":"Спасибо, что помогаете создать атмосферу нашего дня.",css.caption)}</>,css.dress)}
        {girls?section("little-things",<><Sparkles className={css.littleIcon}/>{title("little-things","Что взять с собой")}{text("little-things-copy","Любимую помаду, заряженный телефон и пару историй, которые мы ещё не слышали.\n\nОстальное настроение создадим вместе.",css.body)}</>,css.notes):section("wishes",<>{title("wishes","Ваше присутствие — главное")}{text("wishes-copy","Самый ценный подарок для нас — этот день, проведённый рядом с вами.\n\nЕсли хотите поздравить нас дополнительно, будем благодарны за вклад в нашу семейную мечту.",css.body)}</>,css.notes)}
        {section("rsvp",<>{text("rsvp-overline","RSVP",css.overline)}{title("rsvp",girls?"Ты с нами?":"Будете на нашем празднике?")}{text("rsvp-intro",girls?"Дай знать, что придёшь — мы уже готовим место для тебя.":"Пожалуйста, подтвердите участие, чтобы мы могли позаботиться о каждом госте.",css.body)}
          <form className={css.form} id={formId} onSubmit={async e=>{
            e.preventDefault();if(onChange || reply==="sending")return;
            const data=new FormData(e.currentTarget), name=String(data.get("name")||"").trim();if(!name)return;
            if(inv.id==="demo"||inv.id.startsWith("preview")){setReply("sent");return;}
            setReply("sending");
            try{const result=await fetch(`/api/invitations/${encodeURIComponent(inv.id)}/rsvp`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,rsvp:String(data.get("attendance")||"yes"),plusOne:Math.max(0,Number(data.get("guests")||1)-1),note:String(data.get("note")||"")})});if(!result.ok)throw Error("send");setReply("sent");}catch{setReply("error");}
          }}>
            <label>{text("rsvp-name-label",girls?"Твоё имя":"Ваше имя",css.formLabel)}<WeddingPart id="rsvp-name" label="Поле имени" kind="widget" fallback="Имя и фамилия"><input name="name" aria-label="Имя гостя" required autoComplete="name" maxLength={120} placeholder={weddingStyle(inv,"rsvp-name","placeholder")||"Имя и фамилия"}/></WeddingPart></label>
            <WeddingPart id="rsvp-attendance" label="Присутствие" kind="widget"><fieldset><legend>{text("attendance-label","Подтверждение участия",css.formLabel)}</legend>{["yes","no"].map((value,i)=><label key={value} className={css.radio}><input name="attendance" type="radio" value={value} defaultChecked={i===0}/>{text(`attendance-${value}`,i===0?(girls?"Конечно, буду!":"С радостью приду"):(girls?"В этот раз не смогу":"К сожалению, не смогу"))}</label>)}</fieldset></WeddingPart>
            {!girls?<label>{text("guests-label","Количество гостей",css.formLabel)}<WeddingPart id="rsvp-guests" label="Число гостей" kind="widget"><input name="guests" aria-label="Количество гостей" type="number" defaultValue="1" min="1" max="20" required/></WeddingPart></label>:null}
            <label>{text("note-label",girls?"Пожелания по меню":"Ваши пожелания",css.formLabel)}<WeddingPart id="rsvp-note" label="Поле пожеланий" kind="widget" fallback="Можно оставить пустым"><textarea name="note" aria-label="Пожелания" maxLength={2000} rows={3} placeholder={weddingStyle(inv,"rsvp-note","placeholder")||"Можно оставить пустым"}/></WeddingPart></label>
            <WeddingPart id="rsvp-submit" label="Отправить ответ" kind="widget"><button className={css.button} type="submit" disabled={!!onChange||reply==="sending"||reply==="sent"}>{text("submit-label",girls?"Отправить ответ ♡":"Подтвердить участие")}</button></WeddingPart>
            {reply==="sent"?<p role="status">{inv.id==="demo"||inv.id.startsWith("preview")?"Это предпросмотр. Ответ не отправлен.":"Спасибо! Ваш ответ отправлен."}</p>:null}{reply==="error"?<p role="alert">Не удалось отправить ответ. Попробуйте ещё раз.</p>:null}
          </form>
        </>,css.rsvp)}
        {section("footer",<>{text("footer-heading",girls?"До встречи, девочки!":"С любовью к вам",css.script)}{names("footer-names")}<Heart className={css.footerHeart} fill="currentColor" strokeWidth={0}/><WeddingPart id="footer-date" label="Дата" kind="date" className={css.caption}>{formatted}</WeddingPart></>,css.footer)}
      </div>
    </WeddingEditor>
  </div>;
}
