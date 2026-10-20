"use client";

import type { Invitation } from "@/lib/types";
import { WeddingPart } from "./WeddingEditor";
import css from "./EthnoWedding.module.css";

function Horn() {
  return <path d="M0 19V3C0-14-24-19-24-4c0 11 16 12 16 3M0 3c0-17 24-22 24-7 0 11-16 12-16 3M-9 21 0 12l9 9" />;
}

function Medallion({ className }: { className: string }) {
  return <svg className={className} viewBox="-120 -120 240 240" fill="none" stroke="currentColor" aria-hidden="true">
    <circle r="115" strokeWidth="2"/><circle r="108" strokeWidth="6"/><circle r="88" strokeWidth="2"/><circle r="81"/>
    {Array.from({ length: 20 }, (_, i) => <g key={i} transform={`rotate(${i * 18}) translate(0 -98)`}><path d="m-4 2 4-6 4 6" strokeWidth="2"/></g>)}
    {Array.from({ length: 8 }, (_, i) => <g key={i} transform={`rotate(${i * 45}) translate(0 -55) scale(.8)`} strokeWidth="3"><Horn/></g>)}
    <circle r="32" strokeWidth="3"/><path d="M-30-10Q0 0 30-10M-31 0h62M-30 10Q0 0 30 10M-10-30Q0 0-10 30M0-31v62M10-30Q0 0 10 30" strokeWidth="3"/>
  </svg>;
}

function Pendants() {
  return <svg className={css.pendants} viewBox="0 0 130 300" fill="none" stroke="currentColor" aria-hidden="true">
    {[0, 62].map((x, i) => <g key={x} transform={`translate(${x + 5} ${i ? 0 : -45})`}>
      <path d="M3 0v205l24 28 24-28V0M9 0v202l18 21 18-21V0" strokeWidth="2"/>
      {[35, 85, 135, 185].map(y => <g key={y} transform={`translate(27 ${y}) scale(.65)`} strokeWidth="3"><Horn/></g>)}
      <path d="M27 232v10M23 241h8l10 44q-14 9-28 0Z" fill="currentColor" fillOpacity=".6"/>
      <path d="m27 245-6 40m6-40v43m0-43 6 40" strokeWidth="1"/>
    </g>)}
  </svg>;
}

export function EthnoYurt() {
  return <svg viewBox="0 0 360 210" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M31 117Q70 53 154 30l10-11h32l10 11q84 23 123 87v73q-149 29-298 0Z" fill="#f5ecdc"/>
    <path d="M31 117q149 22 298 0M33 127q147 22 294 0M33 172q147 27 294 0M31 190q149 29 298 0M154 30q26 7 52 0M43 112Q111 58 163 34M316 112Q249 58 197 34M111 124q13-62 63-90M249 124q-13-62-63-90"/>
    <path d="M148 137h64v65h-64Z" fill="#793c36"/><path d="M180 139v61M153 144h22v51h-22Zm32 0h22v51h-22Z" stroke="#d4b782"/>
    {[164, 196].map(x => <path key={x} d={`m${x} 154 7 13-7 13-7-13Z`} stroke="#d4b782"/>)}
    {Array.from({ length: 10 }, (_, i) => <g key={i} transform={`translate(${48 + i * 29} ${i < 4 || i > 5 ? 184 : 120}) scale(.36)`} strokeWidth="4"><Horn/></g>)}
    <path d="M164 19q16-10 32 0M169 19l5-7m6 7V9m6 10-2-7"/>
  </svg>;
}

export function EthnoWeddingHero({ invitation, locale }: { invitation: Invitation; locale: string }) {
  const ru = locale === "ru";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(invitation.date) ? invitation.date.split("-").reverse().join(" · ") : invitation.date;
  return <section className={css.hero}>
    <div className={css.border} aria-hidden="true"/>
    <Pendants/><Medallion className={css.medallion}/>
    <div className={css.heroContent}>
      <WeddingPart id="eventTitle" label="Название праздника" kind="text" fallback={ru ? "Приглашение на свадьбу" : "Үйлөнүү тойго чакыруу"} className={css.eyebrow}/>
      <span className={css.diamond} aria-hidden="true">❖</span>
      <WeddingPart id="names" label="Имена молодожёнов" kind="text" field="names" className={css.names}/>
      <WeddingPart id="ethno-blessing" label="Пожелание" kind="text" fallback={ru ? "Два сердца. Один очаг.\nНачало нашей семьи." : "Эки жүрөк. Бир түндүк.\nЖаңы жашоого ак бата."} className={css.blessing}/>
      <WeddingPart id="event-date" label="Дата и время свадьбы" kind="date" className={css.date}>{date}<span>{invitation.time}</span></WeddingPart>
    </div>
    <div className={css.yurt}><EthnoYurt/></div>
    <div className={css.ribbon} aria-hidden="true">{Array.from({ length: 15 }, (_, i) => <span key={i}>❖</span>)}</div>
  </section>;
}

export function EthnoWeddingPortrait({ locale }: { locale: string }) {
  return <section className={css.portraitSection}>
    <WeddingPart id="ethno-story-title" label="Заголовок фотографии" kind="text" fallback={locale === "ru" ? "С любовью к нашим корням" : "Салт менен башталган сүйүү"} className={css.portraitTitle}/>
    <WeddingPart id="photo-couple" label="Фото молодожёнов" kind="image" slot="couple" className={css.portrait}>
      <div className={css.portraitPlaceholder}><Medallion className={css.portraitMedallion}/><span>{locale === "ru" ? "Здесь будет ваша фотография" : "Бул жерде сиздердин сүрөтүңүздөр болот"}</span></div>
    </WeddingPart>
    <WeddingPart id="ethno-photo-note" label="Подпись к фото" kind="text" fallback={locale === "ru" ? "Пусть наш дом будет полон света, любви и добрых гостей." : "Ак өргөбүз сүйүүгө, бакытка жана жакшы адамдарга толсун."} className={css.blessing}/>
  </section>;
}
