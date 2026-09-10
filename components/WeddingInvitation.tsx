"use client";

import { useEffect, useState } from "react";
import {
  Camera,
  Check,
  Coffee,
  Gem,
  Heart,
  Map,
  MapPin,
  Music2,
  Phone,
  Send,
  Sparkles,
  Utensils,
} from "lucide-react";
import type { Invitation } from "@/lib/types";
import type { InvitePatch } from "./CanvasEdit";
import { WeddingEditor, WeddingPart } from "./WeddingEditor";
import { safeWeddingLink, weddingProgram, type WeddingPartInfo } from "@/lib/weddingEditor";

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-3 text-current">
      <span className="h-px w-10 bg-current opacity-60" />

      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="9"
          y="1"
          width="6"
          height="6"
          transform="rotate(45 12 4)"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <rect
          x="15"
          y="7"
          width="6"
          height="6"
          transform="rotate(45 18 10)"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <rect
          x="3"
          y="7"
          width="6"
          height="6"
          transform="rotate(45 6 10)"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <rect
          x="9"
          y="13"
          width="6"
          height="6"
          transform="rotate(45 12 16)"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>

      <span className="h-px w-10 bg-[#b9946b]/60" />
    </div>
  );
}

function Countdown({ date, time }: { date: string; time?: string }) {
  const weddingDate = new Date(`${date}T${time || "17:00"}:00`);
  const [countdown, setCountdown] = useState({
    days: 65,
    hours: 18,
    minutes: 7,
    seconds: 51,
  });

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, weddingDate.getTime() - now);

      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();

    const id = setInterval(update, 1000);

    return () => clearInterval(id);
  }, [date, time]);

  const items = [
    ["КҮН", countdown.days],
    ["СААТ", countdown.hours],
    ["МИНУТ", countdown.minutes],
    ["СЕКУНД", countdown.seconds],
  ];

  return (
    <div className="mx-auto grid max-w-[330px] grid-cols-4 gap-2 px-3">
      {items.map(([label, value]) => (
        <div
          key={String(label)}
          className="rounded-[8px] border border-[#caaa82]/60 bg-[#f7f0e4]/65 px-1 py-3 text-center"
        >
          <div className="font-serif text-[21px] text-[#40372e]">
            {String(value).padStart(2, "0")}
          </div>

          <div className="mt-1 text-[8px] tracking-[0.08em] text-[#796a59]">
            <WeddingPart id={`countdown-label-${label}`} label={`Подпись таймера: ${label}`} kind="text" fallback={String(label)} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WeddingInvitation({ invitation, onChange, selected, onSelect, onPartsChange, locale = "ky" }: { invitation: Invitation; onChange?: InvitePatch; selected?: string | null; onSelect?: (id: string | null) => void; onPartsChange?: (parts: WeddingPartInfo[]) => void; locale?: string }) {
  const Action = onChange ? "div" : "button";
  const timeline = weddingProgram(invitation);
  const icons = { coffee: Coffee, gem: Gem, camera: Camera, utensils: Utensils, music: Music2, sparkles: Sparkles };
  const phoneGroom = invitation.copy?.["phone-groom"] ?? "+996 700 123 456";
  const phoneBride = invitation.copy?.["phone-bride"] ?? "+996 709 987 654";
  const [attendance, setAttendance] = useState("yes");
  const [drink, setDrink] = useState("");
  const [guests, setGuests] = useState("1");

  const heroPhoto = invitation.gallery?.hero || invitation.coverImage || "/images/hero.jpg";
  const venuePhoto = invitation.gallery?.venue || "/images/venue.jpg";
  const couplePhoto = invitation.gallery?.c1 || "/images/couple-mountains.jpg";

  const names = invitation.names || "Айбек & Айгүл";
  const [groom, bride] = names.split(/\s*[&+/]|\s+менен\s+|\s+жана\s+/).map(s => s.trim());

  return (
    <WeddingEditor invitation={invitation} onChange={onChange} selected={selected} onSelect={onSelect} onPartsChange={onPartsChange} locale={locale}><main style={{"--wedding-page": invitation.blockColors?.page || "#f4ecdf"} as React.CSSProperties} className="min-h-screen bg-[#171714] py-5 text-[#443a31]">
      <article style={{ backgroundColor: invitation.blockColors?.page || "#f4ecdf" }}
        className="
          relative mx-auto w-full max-w-[390px]
          rounded-[34px]
          bg-[var(--wedding-page)]
          shadow-[0_25px_80px_rgba(0,0,0,.55)]
        "
      >
        {/* верхняя имитация Dynamic Island */}
        <WeddingPart id="decoration-1" label={"Декоративный элемент"} kind="block" className="absolute left-1/2 top-[12px] z-50 h-[20px] w-[94px] -translate-x-1/2 rounded-full bg-black" style={{position:"absolute"}} ><span /></WeddingPart>

        {/* =====================================================
            HERO
        ====================================================== */}

        <WeddingPart id="section-0" label={"Главный экран"} kind="block" className="relative" ><WeddingPart id="decoration-2" label={"Декоративный элемент"} kind="block" className="absolute inset-x-0 top-0 z-10 h-[110px] bg-gradient-to-b from-[#f4ecdf] via-[#f4ecdf]/80 to-transparent" style={{position:"absolute"}} ><span /></WeddingPart><WeddingPart id="text-3" label={"БИЗДИН ҮЙЛӨНҮҮ ҮЛПӨТҮ"} kind="text" className="absolute left-0 right-0 top-[41px] z-20 text-center text-[8px] tracking-[0.32em] text-[#73675b]" style={{position:"absolute"}} fallback={"БИЗДИН ҮЙЛӨНҮҮ ҮЛПӨТҮ"} ></WeddingPart><WeddingPart id="photo-hero" label={"Главное фото"} kind="image" className="h-[565px] overflow-hidden" fallback={heroPhoto} slot="hero"></WeddingPart>{/* большая белая карточка имен */}<div
            className="
              relative z-20 -mt-[150px]
              rounded-t-[50%_90px]
              bg-[var(--wedding-page)]
              px-6 pb-8 pt-14
              text-center
            "
          >
            <WeddingPart id="names" label={"Имена"} kind="text" className="
                font-serif
                text-[50px]
                leading-[0.85]
                text-[#26211d]
              " style={{
                fontFamily:
                  '"Cormorant Garamond", "Times New Roman", serif',
                fontStyle: "italic",
              }} fallback={"Айбек & Айгүл"} field="names"></WeddingPart>

            <WeddingPart id="event-date" label={"Дата и время"} kind="date" className="mt-7 font-serif text-[14px] tracking-[0.2em]" >{invitation.date ? new Date(invitation.date).toLocaleDateString('ky-KG', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('.').join(' · ') : "28 · 08 · 2026"}</WeddingPart>

            <WeddingPart id="text-4" label={"БИЗДИН ӨЗГӨЧӨ КҮНГӨ\nЧАКЫРАБЫЗ!"} kind="text" className="mt-3 text-[8px] tracking-[0.25em] text-[#6d6257]" fallback={"БИЗДИН ӨЗГӨЧӨ КҮНГӨ\nЧАКЫРАБЫЗ!"} ></WeddingPart>

            <WeddingPart id="countdown" label={"Обратный отсчёт"} kind="widget" className="mt-6" ><Countdown date={invitation.date || "2026-08-28"} time={invitation.time} /></WeddingPart>

            <div className="mt-7">
              <WeddingPart id="ornament-1" label="Орнамент 1" kind="decoration" style={{color:"#a27b50"}}><Ornament /></WeddingPart>
            </div>

            <WeddingPart id="text-5" label={"КЫРМАТТУУ\nДОСТОРУБУЗ!"} kind="text" className="mt-5 font-serif text-[18px] tracking-[0.12em]" fallback={"КЫРМАТТУУ\nДОСТОРУБУЗ!"} ></WeddingPart>

            <WeddingPart id="message" label={"Текст приглашения"} kind="text" className="mx-auto mt-4 max-w-[300px] font-serif text-[13px] leading-[1.6]" fallback={"Биздин жашообуздагы эң маанилүү күндүн сиздер менен бирге бөлүштүрүүгө кубанычтабыз!\nСиздерди биздин үйлөнүү тоюбузга чакырабыз!"} field="message"></WeddingPart>

            <div className="mt-7">
              <WeddingPart id="ornament-2" label="Орнамент 2" kind="decoration" style={{color:"#a27b50"}}><Ornament /></WeddingPart>
            </div>
          </div></WeddingPart>

        {/* =====================================================
            SECOND PHOTO
        ====================================================== */}

        <WeddingPart id="section-1" label={"Фотография пары"} kind="block" ><WeddingPart id="photo-c1" label={"Фото пары"} kind="image" className="h-[440px]" fallback={couplePhoto} slot="c1"></WeddingPart><div
            className="
              relative -mt-[60px]
              rounded-t-[50%_65px]
              bg-[var(--wedding-page)]
              px-8 pb-10 pt-12
              text-center
            "
          >
            <WeddingPart id="text-7" label={"БАКЫТ —"} kind="text" className="text-[9px] tracking-[0.16em] text-[#7e7061]" fallback={"БАКЫТ —"} ></WeddingPart>

            <WeddingPart id="text-8" label={"ЖАКЫНДА МЕНЕН БИРГЕ"} kind="text" className="mt-2 font-serif text-[16px] tracking-[0.12em]" fallback={"ЖАКЫНДА МЕНЕН БИРГЕ"} ></WeddingPart>

            <div className="mt-5">
              <WeddingPart id="ornament-3" label="Орнамент 3" kind="decoration" style={{color:"#a27b50"}}><Ornament /></WeddingPart>
            </div>
          </div></WeddingPart>

        {/* =====================================================
            PROGRAM
        ====================================================== */}

        <WeddingPart id="section-2" label={"Программа"} kind="block" className="px-7 pb-12 pt-8" ><WeddingPart id="text-9" label={"КҮНДҮН ПРОГРАММАСЫ"} kind="text" className="text-center font-serif text-[19px] tracking-[0.14em]" fallback={"КҮНДҮН ПРОГРАММАСЫ"} ></WeddingPart><div className="mt-5 flex justify-center">
            <WeddingPart id="ornament-4" label="Орнамент 4" kind="decoration" style={{color:"#a27b50"}}><Ornament /></WeddingPart>
          </div><div className="relative mx-auto mt-8 max-w-[285px]">
            <WeddingPart id="decoration-10" label={"Декоративный элемент"} kind="block" className="absolute bottom-[22px] left-[26px] top-[22px] w-px bg-[#ad8b66]" style={{position:"absolute"}} ><span /></WeddingPart>

            <div className="space-y-7">
              {timeline.map((item) => {
                const Icon = icons[(invitation.copy?.[`$icon:program-icon-${item.id}`] || item.icon) as keyof typeof icons] || Sparkles;

                return (
                  <WeddingPart id={`program-${item.id}`} label={"Пункт программы"} kind="block" className="relative grid grid-cols-[54px_1fr] items-center gap-4" key={item.id}><WeddingPart id={`program-icon-${item.id}`} label={"Иконка программы"} kind="decoration" className="
                        relative z-10 flex h-[52px] w-[52px]
                        items-center justify-center rounded-full
                        bg-[#a47f58] text-[#fff9ed]
                      " ><Icon size={23} strokeWidth={1.35} /></WeddingPart><div>
                      <WeddingPart id={`program-time-${item.id}`} label={"Программа: время"} kind="text" className="font-serif text-[13px]" fallback={item.time} ></WeddingPart>

                      <WeddingPart id={`program-title-${item.id}`} label={"Программа: название"} kind="text" className="mt-[3px] font-serif text-[12px] leading-[1.3]" fallback={item.title} ></WeddingPart>

                      {(item.subtitle || onChange || invitation.copy?.[`program-subtitle-${item.id}`]) && (
                        <WeddingPart id={`program-subtitle-${item.id}`} label={"Программа: описание"} kind="text" className="font-serif text-[11px] leading-[1.3]" fallback={item.subtitle} ></WeddingPart>
                      )}
                    </div></WeddingPart>
                );
              })}
            </div>
          </div>{onChange ? <button type="button" data-export-hide className="mt-4 w-full rounded-lg border border-dashed border-[#a9855d] p-2 text-xs" onClick={() => onChange({copy:{...invitation.copy,"wedding.program":JSON.stringify([...timeline,{id:crypto.randomUUID(),time:"18:00",title:"Новый пункт",subtitle:"",icon:"sparkles"}])}})}>+ Пункт программы</button> : null}</WeddingPart>

        {/* =====================================================
            VENUE
        ====================================================== */}

        <WeddingPart id="section-3" label={"Место проведения"} kind="block" className="px-6 pb-11" ><WeddingPart id="ornament-5" label="Орнамент 5" kind="decoration" style={{color:"#a27b50"}}><Ornament /></WeddingPart><WeddingPart id="text-11" label={"ӨТКӨРҮҮ ЖЕРИ"} kind="text" className="mt-6 text-center font-serif text-[18px] tracking-[0.14em]" fallback={"ӨТКӨРҮҮ ЖЕРИ"} ></WeddingPart><WeddingPart id="photo-venue" label={"Фото места"} kind="image" className="h-[190px] mt-5 overflow-hidden rounded-[15px]" fallback={venuePhoto} slot="venue"></WeddingPart><div className="mt-4 text-center">
            <WeddingPart id="venue" label={"Название места"} kind="text" className="font-serif text-[18px]" fallback={"«Ала-Тоо»"} field="venue"></WeddingPart>

            <WeddingPart id="text-12" label={"Загородный комплекс"} kind="text" className="mt-1 text-[10px] text-[#76695c]" fallback={"Загородный комплекс"} ></WeddingPart>

            <WeddingPart id="address-block" label={"Адрес"} kind="block" className="mt-3 flex items-center justify-center gap-2 font-serif text-[11px]" ><WeddingPart id="address-icon" label="Значок адреса" kind="decoration" style={{color:"#a27b50"}}><MapPin size={15}/></WeddingPart><div><WeddingPart id="address" label="Адрес" kind="text" field="address" fallback="Ысык-Көл облусу,"/><WeddingPart id="city" label="Город" kind="text" field="city" fallback="Бостери айылы"/></div></WeddingPart>

            <WeddingPart id="map-button" label="Кнопка карты" kind="widget"><Action style={{backgroundColor:invitation.blockColors?.["map-button"]}} onClick={() => { if (!onChange) window.open(safeWeddingLink(invitation.mapUrl || "https://2gis.kg/search/" + encodeURIComponent([invitation.venue, invitation.address, invitation.city].join(" "))), "_blank", "noopener,noreferrer"); }}
              type="button"
              className="
                mt-5 flex h-[48px] w-full
                items-center justify-center gap-3
                rounded-full
                bg-[#dfbd8d]
                font-serif text-[11px]
                tracking-[0.06em]
                transition
                hover:brightness-95
              "
            ><Map size={17} /><WeddingPart id="map-label" label="Текст кнопки карты" kind="text" fallback="КАРТАДА КӨРҮҮ"/>
            </Action></WeddingPart>
          </div></WeddingPart>

        {/* second venue image */}
        <div className="px-6">
          <WeddingPart id="photo-venue2" label={"Второе фото места"} kind="image" className="h-[185px] overflow-hidden rounded-[15px]" fallback={"/images/venue-2.jpg"} slot="venue2"></WeddingPart>
        </div>

        {/* =====================================================
            DRESS CODE
        ====================================================== */}

        <WeddingPart id="section-4" label={"Дресс-код"} kind="block" className="px-7 py-11 text-center" ><WeddingPart id="text-13" label={"ДРЕСС-КОД"} kind="text" className="font-serif text-[18px] tracking-[0.14em]" fallback={"ДРЕСС-КОД"} ></WeddingPart><WeddingPart id="dressCode" label={"Описание дресс-кода"} kind="text" className="mx-auto mt-4 max-w-[290px] font-serif text-[11px] leading-[1.5]" fallback={"Биз үчүн сиздердин кийим стилиңиздер маанилүү. Сураныч, төмөнкү түстөрдү эске алыңыз."} field="dressCode"></WeddingPart><div className="mt-6 flex justify-center gap-[7px]">
            {[
              "#ece4d3",
              "#cfcab9",
              "#7b806c",
              "#69594b",
              "#754348",
              "#26342f",
            ].map((color, index) => (
              <WeddingPart id={`dress-${index}`} label={"Цвет дресс-кода"} kind="block" className="h-[27px] w-[27px] rounded-full" style={{ backgroundColor: color }} key={index}><span /></WeddingPart>
            ))}
          </div><div className="mt-7">
            <WeddingPart id="ornament-6" label="Орнамент 6" kind="decoration" style={{color:"#a27b50"}}><Ornament /></WeddingPart>
          </div><WeddingPart id="text-15" label={"Кооз адамдар —\nкооз күндү дагы да өзгөчө кыла"} kind="text" className="mt-6 font-serif text-[20px] italic leading-[1.35]" style={{
              fontFamily:
                '"Cormorant Garamond", "Times New Roman", serif',
            }} fallback={"Кооз адамдар —\nкооз күндү дагы да өзгөчө кылат"} ></WeddingPart><div className="mt-7">
            <WeddingPart id="ornament-7" label="Орнамент 7" kind="decoration" style={{color:"#a27b50"}}><Ornament /></WeddingPart>
          </div></WeddingPart>

        {/* =====================================================
            RSVP
        ====================================================== */}

        <WeddingPart id="section-5" label={"Ответ гостей"} kind="block" className="border-t border-[#c8aa86]/30 px-7 py-11" ><WeddingPart id="text-16" label={"КАТЫШУУҢУЗДУ\nЫРАСТАҢЫЗ"} kind="text" className="text-center font-serif text-[18px] tracking-[0.13em]" fallback={"КАТЫШУУҢУЗДУ\nЫРАСТАҢЫЗ"} ></WeddingPart><div className="mt-5">
            <WeddingPart id="ornament-8" label="Орнамент 8" kind="decoration" style={{color:"#a27b50"}}><Ornament /></WeddingPart>
          </div><WeddingPart id="text-17" label={"Сураныч, катышууңузду\nырастайсыз. Бул биз үчү"} kind="text" className="mt-5 text-center font-serif text-[10px] leading-[1.5]" fallback={"Сураныч, катышууңузду\nырастайсыз. Бул биз үчүн абдан маанилүү!"} ></WeddingPart><div className="mt-6 space-y-2">
            <WeddingPart id="button-19" label="Кнопка формы" kind="widget"><Action style={{backgroundColor:invitation.blockColors?.["button-19"]}}
              type="button"
              onClick={() => { if (!onChange) setAttendance("yes"); }}
              className="
                flex w-full items-center gap-3 rounded-[9px]
                border border-[#c5aa8a]/55
                bg-[#f8f2e9]/45
                px-3 py-3 text-left
              "
            ><span
                className={`
                  flex h-[18px] w-[18px] items-center justify-center
                  rounded-full border
                  ${
                    attendance === "yes"
                      ? "border-[#365348] bg-[#365348] text-white"
                      : "border-[#b9a68e]"
                  }
                `}
              >
                {attendance === "yes" && <Check size={11} />}
              </span><WeddingPart id="text-18" label={"Ооба, келем"} kind="text" className="font-serif text-[11px]" fallback={"Ооба, келем"} ></WeddingPart></Action></WeddingPart>

            <WeddingPart id="button-21" label="Кнопка формы" kind="widget"><Action style={{backgroundColor:invitation.blockColors?.["button-21"]}}
              type="button"
              onClick={() => { if (!onChange) setAttendance("no"); }}
              className="
                flex w-full items-center gap-3 rounded-[9px]
                border border-[#c5aa8a]/55
                bg-[#f8f2e9]/45
                px-3 py-3 text-left
              "
            ><span
                className={`
                  flex h-[18px] w-[18px] items-center justify-center
                  rounded-full border
                  ${
                    attendance === "no"
                      ? "border-[#365348] bg-[#365348] text-white"
                      : "border-[#b9a68e]"
                  }
                `}
              >
                {attendance === "no" && <Check size={11} />}
              </span><WeddingPart id="text-20" label={"Тилекке каршы, келе албайм"} kind="text" className="font-serif text-[11px]" fallback={"Тилекке каршы, келе албайм"} ></WeddingPart></Action></WeddingPart>
          </div><WeddingPart id="form-22" label={"Поле формы"} kind="widget" className="mt-6 block" fallback={"Мисалы: Эрланбек Темирбеков"} ><label className="contents"><WeddingPart id="text-23" label={"Сиздин аты-жөнүңүз жана фамилияңыз"} kind="text" className="mb-2 block font-serif text-[10px]" fallback={"Сиздин аты-жөнүңүз жана фамилияңыз"} ></WeddingPart><input
              type="text"
              placeholder={invitation.copy?.["$placeholder:form-22"] ?? "Мисалы: Эрланбек Темирбеков"}
              className="
                h-[43px] w-full rounded-[7px]
                border border-[#c6ad8e]/50
                bg-transparent
                px-3
                font-serif text-[11px]
                outline-none
                placeholder:text-[#aa9d8e]
                focus:border-[#96714d]
              "
            /></label></WeddingPart><WeddingPart id="form-24" label={"Поле формы"} kind="widget" className="mt-5 block" ><label className="contents"><WeddingPart id="text-25" label={"Коноктордун саны"} kind="text" className="mb-2 block font-serif text-[10px]" fallback={"Коноктордун саны"} ></WeddingPart><select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="
                h-[43px] w-full rounded-[7px]
                border border-[#c6ad8e]/50
                bg-transparent
                px-3
                font-serif text-[11px]
                outline-none
              "
            >
              <option value="1">1 конок</option>
              <option value="2">2 конок</option>
              <option value="3">3 конок</option>
              <option value="4">4 конок</option>
              <option value="5">5 конок</option>
            </select></label></WeddingPart><WeddingPart id="form-26" label={"Поле формы"} kind="widget" className="mt-5 block" ><label className="contents"><WeddingPart id="text-27" label={"Сиздун каалоо-тилектериңиз"} kind="text" className="mb-2 block font-serif text-[10px]" fallback={"Сиздун каалоо-тилектериңиз"} ></WeddingPart><textarea
              rows={4}
              placeholder="Бизге каалоо-тилектериңизди жазыңыз..."
              className="
                w-full resize-none rounded-[7px]
                border border-[#c6ad8e]/50
                bg-transparent
                p-3
                font-serif text-[11px]
                outline-none
                placeholder:text-[#aa9d8e]
                focus:border-[#96714d]
              "
            /></label></WeddingPart><WeddingPart id="button-29" label="Кнопка формы" kind="widget"><Action style={{backgroundColor:invitation.blockColors?.["button-29"]}}
            type="button"
            className="
              mt-5 flex h-[48px] w-full
              items-center justify-center gap-2
              rounded-full
              bg-[#30483e]
              text-[#f8f1e6]
              shadow-sm
            "
          ><Send size={16} strokeWidth={1.5} /><WeddingPart id="text-28" label={"ЖӨНӨТҮҮ"} kind="text" className="font-serif text-[11px] tracking-[0.1em]" fallback={"ЖӨНӨТҮҮ"} ></WeddingPart></Action></WeddingPart></WeddingPart>

        {/* =====================================================
            DRINKS
        ====================================================== */}

        <WeddingPart id="section-6" label={"Напитки"} kind="block" className="px-7 pb-11" ><WeddingPart id="ornament-9" label="Орнамент 9" kind="decoration" style={{color:"#a27b50"}}><Ornament /></WeddingPart><WeddingPart id="text-30" label={"НАПИТКИЛЕР"} kind="text" className="mt-7 font-serif text-[17px] tracking-[0.12em]" fallback={"НАПИТКИЛЕР"} ></WeddingPart><WeddingPart id="text-31" label={"Сиз эмнени артык көрөсүз?\n(милдеттүү эмес)"} kind="text" className="mt-4 font-serif text-[10px] leading-[1.5]" fallback={"Сиз эмнени артык көрөсүз?\n(милдеттүү эмес)"} ></WeddingPart><div className="mt-5 space-y-4">
            {[
              "Алкоголсуз",
              "Шампанское",
              "Вино (ак / кызыл)",
              "Башка вариант",
            ].map((item, index) => (
              <WeddingPart id={`form-drink-${index}`} label={"Поле формы"} kind="widget" className="flex cursor-pointer items-center gap-3"  key={item}><label className="contents"><input
                  type="radio"
                  name="drink"
                  value={item}
                  checked={drink === item}
                  onChange={() => setDrink(item)}
                  className="sr-only"
                /><span
                  className={`
                    flex h-[15px] w-[15px] items-center justify-center
                    rounded-full border border-[#a98d6d]
                    ${
                      drink === item
                        ? "before:h-[7px] before:w-[7px] before:rounded-full before:bg-[#8d6747]"
                        : ""
                    }
                  `}
                /><WeddingPart id={`drink-${index}`} label={"Напиток"} kind="text" className="font-serif text-[11px]" fallback={item} ></WeddingPart></label></WeddingPart>
            ))}
          </div></WeddingPart>

        {/* =====================================================
            CONTACTS
        ====================================================== */}

        <WeddingPart id="section-7" label={"Контакты"} kind="block" className="px-7 pb-11" ><WeddingPart id="ornament-10" label="Орнамент 10" kind="decoration" style={{color:"#a27b50"}}><Ornament /></WeddingPart><WeddingPart id="text-32" label={"БАЙЛАНЫШТАР"} kind="text" className="mt-7 font-serif text-[17px] tracking-[0.12em]" fallback={"БАЙЛАНЫШТАР"} ></WeddingPart><WeddingPart id="text-33" label={"Суроолоруңуз болсо, биз менен байланышыңыз!"} kind="text" className="mt-4 font-serif text-[10px]" fallback={"Суроолоруңуз болсо, биз менен байланышыңыз!"} ></WeddingPart><div className="mt-5 space-y-3">
            <a
              href={safeWeddingLink(`tel:${phoneGroom.replace(/[^+0-9]/g, "")}`)} onClick={e => { if (onChange) e.preventDefault(); }}
              className="
                flex items-center gap-4 rounded-[9px]
                border border-[#c8ae8e]/45
                p-3
              "
            >
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#a9855d] text-white">
                <Phone size={18} />
              </div>

              <div className="font-serif">
                <WeddingPart id="contact-groom" label={"Имя контакта 1"} kind="text" className="text-[12px]" fallback={groom || "Айбек"} ></WeddingPart>
                <WeddingPart id="phone-groom" label={"Телефон"} kind="text" className="mt-1 text-[11px]" fallback={"+996 700 123 456"} ></WeddingPart>
              </div>
            </a>

            <a
              href={safeWeddingLink(`tel:${phoneBride.replace(/[^+0-9]/g, "")}`)} onClick={e => { if (onChange) e.preventDefault(); }}
              className="
                flex items-center gap-4 rounded-[9px]
                border border-[#c8ae8e]/45
                p-3
              "
            >
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#a9855d] text-white">
                <Phone size={18} />
              </div>

              <div className="font-serif">
                <WeddingPart id="contact-bride" label={"Имя контакта 2"} kind="text" className="text-[12px]" fallback={bride || "Айгүл"} ></WeddingPart>
                <WeddingPart id="phone-bride" label={"Телефон"} kind="text" className="mt-1 text-[11px]" fallback={"+996 709 987 654"} ></WeddingPart>
              </div>
            </a>
          </div></WeddingPart>

        {/* =====================================================
            FINAL
        ====================================================== */}

        <WeddingPart id="section-8" label={"Завершение"} kind="block" className="relative overflow-hidden px-7 pb-28 pt-5 text-center" ><WeddingPart id="ornament-11" label="Орнамент 11" kind="decoration" style={{color:"#a27b50"}}><Ornament /></WeddingPart><WeddingPart id="text-36" label={"Бул кечени биз үчүн дагы\nбирге бөлүшүүңүз үчү"} kind="text" className="mx-auto mt-8 max-w-[270px] font-serif text-[18px] italic leading-[1.45]" style={{
              fontFamily:
                '"Cormorant Garamond", "Times New Roman", serif',
            }} fallback={"Бул кечени биз үчүн дагы\nбирге бөлүшүүңүз үчүн\nчын жүрөктөн күтөбүз!"} ></WeddingPart><WeddingPart id="heart" label={"Сердце"} kind="decoration" className="mx-auto mt-6 fill-[#b08a65] text-[#b08a65]" ><Heart size={20} className="mx-auto" fill="currentColor" /></WeddingPart>{/* декоративные горы */}<WeddingPart id="mountains" label={"Горы"} kind="decoration" className="absolute bottom-0 left-0 w-full text-[#b79670]" style={{position:"absolute"}} ><svg
            viewBox="0 0 390 150"
            className="w-full"
            fill="none"
          >
            <path
              d="
                M0 137
                L55 96
                L79 111
                L128 56
                L155 87
                L189 31
                L230 86
                L260 55
                L295 91
                L329 69
                L390 127
              "
              stroke="currentColor"
              strokeWidth="1"
              opacity=".5"
            />

            <path
              d="
                M72 113 L128 56 L117 91
                M128 56 L143 98
                M151 88 L189 31 L178 78
                M189 31 L213 77
                M231 86 L260 55 L252 86
                M260 55 L279 88
              "
              stroke="currentColor"
              strokeWidth=".8"
              opacity=".42"
            />

            <path
              d="M95 126 H303"
              stroke="currentColor"
              strokeWidth=".8"
              opacity=".5"
            />

            <path
              d="
                M145 125
                V103
                L190 86
                L238 105
                V125
              "
              stroke="currentColor"
              strokeWidth=".9"
              opacity=".55"
            />
          </svg></WeddingPart><WeddingPart id="text-37" label={"СҮЙҮҮ ТҮБӨЛҮК"} kind="text" className="absolute bottom-7 left-0 right-0 text-[8px] tracking-[0.32em] text-[#92775c]" style={{position:"absolute"}} fallback={"СҮЙҮҮ ТҮБӨЛҮК"} ></WeddingPart></WeddingPart>

        {/* ornament footer */}
        <WeddingPart id="decoration-38" label={"Декоративный элемент"} kind="block" className="
            h-[40px]
            border-t border-[#c49f77]/30
            bg-[radial-gradient(circle_at_10px_-5px,transparent_18px,#d4b990_19px,#d4b990_20px,transparent_21px)]
            bg-[length:38px_38px]
            opacity-50
          " ><span /></WeddingPart>
      </article>
    </main></WeddingEditor>
  );
}
