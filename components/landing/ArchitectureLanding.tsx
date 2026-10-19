"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import { useI18n } from "@/lib/locale";
import styles from "./Architecture.module.css";

export function ArchitectureLanding() {
  const { locale, t } = useI18n();
  const ru = locale === "ru";
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const slides = [
    { image: "/images/hero-toi.jpg", title: ru ? "Ваш день.\nВаша история." : "Сиздин күн.\nСиздин окуя.", label: ru ? "Свадебные приглашения" : "Үйлөнүү тойго чакыруу" },
    { image: "/images/hero.jpg", title: ru ? "Традиции,\nкоторые объединяют." : "Салт менен\nсезим бирге.", label: ru ? "Современный взгляд на традиции" : "Салтка заманбап көз караш" },
    { image: "/images/hero-family.webp", title: ru ? "Близкие люди.\nВажные моменты." : "Жакын адамдар.\nӨзгөчө көз ирмемдер.", label: ru ? "Семейные торжества" : "Үй-бүлөлүк майрамдар" },
  ];
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(true);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setActive(value => (value + 1) % 3), 7000);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <article className={styles.page}>
      <section className={styles.hero} aria-label={ru ? "Приглашения Toichakyru" : "Toichakyru чакыруулары"} aria-roledescription="carousel">
        {slides.map((slide, index) => <div key={slide.image} className={`${styles.slide} ${active === index ? styles.active : ""}`} aria-hidden={active !== index}>
          <img src={slide.image} alt="" fetchPriority={index === 0 ? "high" : "auto"} />
        </div>)}
        <div className={styles.shade} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>TOICHAKYRU / {ru ? "ЦИФРОВЫЕ ПРИГЛАШЕНИЯ" : "САНАРИП ЧАКЫРУУЛАР"}</p>
          <h1>{slides[active].title}</h1>
          <div className={styles.heroBottom}>
            <p>{ru ? "Красивое начало вашего праздника.\nСоздайте приглашение и соберите любимых рядом." : "Майрамыңыздын кооз башталышы.\nЧакыруу түзүп, жакындарыңызды чогултуңуз."}</p>
            <Link className={styles.button} href="/templates">{t.hero.cta}<ArrowUpRight size={20} /></Link>
          </div>
        </div>
        <div className={styles.heroFoot}>
          <span className={styles.slideLabel}>0{active + 1} / 03 <span>{slides[active].label}</span></span>
          <div className={styles.controls}>
            {slides.map((slide, index) => <button key={slide.image} type="button" aria-label={slide.label} aria-pressed={index === active} onClick={() => { setActive(index); setPlaying(false); }} className={active === index ? styles.selectedDot : ""}><span /></button>)}
            <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? (ru ? "Остановить слайдер" : "Слайдерди токтотуу") : (ru ? "Запустить слайдер" : "Слайдерди баштоо")}>{playing ? <Pause size={14} /> : <Play size={14} />}</button>
          </div>
          <a href="#collections" className={styles.explore}>{ru ? "ЛИСТАЙТЕ ВНИЗ" : "ТӨМӨН ЖЫЛДЫРЫҢЫЗ"}<ArrowDown size={16} /></a>
        </div>
      </section>

      <section id="collections" className={styles.section}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / {ru ? "КОЛЛЕКЦИИ" : "КОЛЛЕКЦИЯЛАР"}</p><h2>{ru ? "Для ваших\nособенных событий" : "Өзгөчө күндөргө —\nөзгөчө чакыруу"}</h2></div><Link className={styles.textLink} href="/templates">{t.nav.templates}<ArrowUpRight size={20} /></Link></div>
        <div className={styles.collections}>
          {[
            { image: "/images/hero-toi.jpg", title: ru ? "Свадьба" : "Үйлөнүү той", sub: ru ? "Начало вашей общей истории" : "Бирге жазылган жаңы окуя" },
            { image: "/images/templates/kyz-uzatuu-photo/hero-themed.webp", title: "Кыз узатуу", sub: ru ? "С теплом и уважением к традициям" : "Салтты сактаган жылуу чакыруу" },
            { image: "/images/hero-family.webp", title: ru ? "Семейные праздники" : "Үй-бүлөлүк майрамдар", sub: ru ? "Повод собраться вместе" : "Жакындар менен чогуу" },
          ].map((item, index) => <Link href="/templates" key={item.title} className={styles.collection}>
            <img src={item.image} alt={item.title} loading="lazy" />
            <span className={styles.cardNumber}>0{index + 1}</span>
            <div className={styles.cardCaption}><div><p>{item.sub}</p><h3>{item.title}</h3></div><ArrowUpRight size={26} /></div>
          </Link>)}
        </div>
      </section>

      <section className={`${styles.section} ${styles.about}`}>
        <div className={styles.aboutImage}><img src="/images/hero.jpg" alt={ru ? "Пара на фоне гор Кыргызстана" : "Кыргызстандын тоолорунун фонундагы түгөйлөр"} loading="lazy" /><span>TOICHAKYRU · KYRGYZSTAN</span></div>
        <div className={styles.aboutCopy}><p className={styles.eyebrow}>02 / {ru ? "НАША ИДЕЯ" : "БИЗДИН ИДЕЯ"}</p><h2>{ru ? "Большие чувства.\nВ одной ссылке." : "Чоң сезимдер.\nБир шилтемеде."}</h2><p>{ru ? "Мы верим, что праздник начинается с приглашения. В нём — ваша история, настроение и внимание к каждому гостю." : "Майрам чакыруудан башталат деп ишенебиз. Анда сиздин окуяңыз, маанайыңыз жана ар бир конокко болгон көңүлүңүз бар."}</p><p>{t.hero.desc}</p><Link href="/templates" className={styles.textLink}>{ru ? "Найти своё приглашение" : "Өз чакырууңузду тандаңыз"}<ArrowUpRight size={20} /></Link></div>
      </section>

      <section id="how" className={`${styles.section} ${styles.how}`}>
        <div><p className={styles.eyebrow}>03 / {ru ? "КАК ЭТО РАБОТАЕТ" : "КАНТИП ИШТЕЙТ"}</p><h2>{ru ? "От идеи\nдо приглашения" : "Идеядан\nчакырууга чейин"}</h2><Link className={styles.textLink} href="/learn">{t.nav.learn}<ArrowUpRight size={20} /></Link></div>
        <div>{t.how.map((step, index) => <div key={step.n} className={styles.step}><span>0{index + 1}</span><div><h3>{step.t}</h3><p>{step.d}</p></div></div>)}</div>
      </section>

      <section className={`${styles.section} ${styles.faq}`}><div><p className={styles.eyebrow}>04 / FAQ</p><h2>{t.faqTitle}</h2></div><div>{t.faq.map(item => <details key={item.q}><summary>{item.q}<span aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}</div></section>

      <section className={styles.contact}><img src="/images/venue-table.jpg" alt="" loading="lazy" /><div className={styles.contactContent}><p className={styles.eyebrow}>{ru ? "ВАШ ПРАЗДНИК НАЧИНАЕТСЯ ЗДЕСЬ" : "МАЙРАМЫҢЫЗ УШУЛ ЖЕРДЕН БАШТАЛАТ"}</p><h2>{ru ? "Пригласите\nкрасиво." : "Жакындарды\nкооз чакырыңыз."}</h2><div className={styles.contactActions}><Link className={styles.button} href="/templates">{t.hero.cta}<ArrowUpRight size={20} /></Link><Link className={styles.textLink} href="/pricing">{t.nav.pricing}<ArrowUpRight size={18} /></Link></div></div></section>
    </article>
  );
}
