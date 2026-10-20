"use client";

import type { Invitation } from "@/lib/types";
import { WeddingPart } from "./WeddingEditor";
import { EthnoYurt, Medallion } from "./EthnoWeddingHero";
import css from "./RedEthnoWedding.module.css";

/** The roof poles converge on the tunduk, like the interior of a boz ui. */
function YurtCeiling() {
  return <svg className={css.ceiling} viewBox="-240 -180 480 520" fill="none" aria-hidden="true">
    <ellipse cy="-30" rx="350" ry="360" fill="#42100f"/>
    {Array.from({ length: 44 }, (_, i) => <g key={i} transform={`translate(0 -30) rotate(${i * 360 / 44})`}>
      <path d="M0 98 0 510" stroke="#190908" strokeWidth="12"/>
      <path d="M0 98 0 510" stroke="#9b3027" strokeWidth="6"/>
      <path d="M2 100 2 510" stroke="#db9861" strokeWidth="1" opacity=".55"/>
    </g>)}
    <g transform="translate(0 -30)">
      <circle r="105" fill="#f7dfb4" stroke="#c59754" strokeWidth="6"/>
      <circle r="96" stroke="#8b2a22" strokeWidth="3"/>
      <path d="M-91-20Q0-44 91-20M-95-8Q0-32 95-8M-95 8Q0-16 95 8M-91 20Q0-4 91 20M-20-91Q-4 0-20 91M-8-95Q8 0-8 95M8-95Q24 0 8 95M20-91Q36 0 20 91" stroke="#8b2a22" strokeWidth="4"/>
      {Array.from({ length: 32 }, (_, i) => <path key={i} d="m-3-101 3 4 3-4" stroke="#8b2a22" transform={`rotate(${i * 11.25})`}/>)}
    </g>
    {[-165, 165].map(x => <g key={x} transform={`translate(${x} 68)`} stroke="#cca66a">
      <path d="M0 0v56" strokeWidth="2"/><path d="m0 51-10 31q10 8 20 0Z" fill="#b54d32"/>
      <path d="M0 85v18m0-2-13 40q13 8 26 0Z" fill="#b54d32"/>
    </g>)}
  </svg>;
}

export function RedEthnoWeddingHero({ invitation, locale }: { invitation: Invitation; locale: string }) {
  const ru = locale === "ru";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(invitation.date) ? invitation.date.split("-").reverse().join(" · ") : invitation.date;
  return <section className={css.hero}>
    <YurtCeiling/>
    <div className={css.orbitLeft}><Medallion className={css.rotatingOrnament}/></div>
    <div className={css.orbitRight}><Medallion className={css.rotatingOrnament}/></div>
    <WeddingPart id="eventTitle" label="Название праздника" kind="text" fallback={ru ? "Приглашение на свадьбу" : "Үйлөнүү тойго чакыруу"} className={css.kicker}/>
    <div className={css.frame}>
      <span className={css.finial} aria-hidden="true">❦</span>
      <WeddingPart id="names" label="Имена молодожёнов" kind="text" field="names" className={css.names}/>
      <span className={css.flourish} aria-hidden="true">— ❖ —</span>
      <WeddingPart id="event-date" label="Дата и время свадьбы" kind="date" className={css.date}>{date}<span>{invitation.time}</span></WeddingPart>
      <span className={css.bottomFinial} aria-hidden="true">❦</span>
    </div>
    <WeddingPart id="red-ethno-motto" label="Подпись обложки" kind="text" fallback={ru ? "Под одним түндүком.\nС любовью на всю жизнь." : "Бир түндүктүн алдында.\nӨмүр бою бирге."} className={css.motto}/>
    <div className={css.woven} aria-hidden="true">{Array.from({ length: 11 }, (_, i) => <span key={i}>◇❖</span>)}</div>
  </section>;
}

export function RedEthnoWeddingPortrait({ locale }: { locale: string }) {
  const ru = locale === "ru";
  return <section className={css.story}>
    <div className={css.storyOrbit}><Medallion className={css.rotatingOrnament}/></div>
    <span className={css.flourish} aria-hidden="true">❦</span>
    <WeddingPart id="red-ethno-story-title" label="Заголовок" kind="text" fallback={ru ? "Семья начинается\nс любви и благословения" : "Сүйүү менен башталып,\nак бата менен улансын"} className={css.storyTitle}/>
    <WeddingPart id="photo-couple" label="Фото молодожёнов" kind="image" slot="couple" className={css.portrait}>
      <div className={css.portraitPlaceholder}><EthnoYurt/><span>{ru ? "Ваша фотография" : "Сиздердин сүрөтүңүздөр"}</span></div>
    </WeddingPart>
    <WeddingPart id="red-ethno-photo-note" label="Подпись к фото" kind="text" fallback={ru ? "Тепло родного дома, дорогие люди рядом и наша новая история." : "Үйдүн жылуулугу, жакындардын мээрими жана биздин жаңы тарыхыбыз."} className={css.storyNote}/>
  </section>;
}
