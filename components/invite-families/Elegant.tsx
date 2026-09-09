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
import type { LayoutKit } from "../Site3DLayouts";

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-3 text-[#a27b50]">
      <span className="h-px w-10 bg-[#b9946b]/60" />
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="9" y="1" width="6" height="6" transform="rotate(45 12 4)" stroke="currentColor" strokeWidth="1.2" />
        <rect x="15" y="7" width="6" height="6" transform="rotate(45 18 10)" stroke="currentColor" strokeWidth="1.2" />
        <rect x="3" y="7" width="6" height="6" transform="rotate(45 6 10)" stroke="currentColor" strokeWidth="1.2" />
        <rect x="9" y="13" width="6" height="6" transform="rotate(45 12 16)" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <span className="h-px w-10 bg-[#b9946b]/60" />
    </div>
  );
}

function Countdown({ weddingDate }: { weddingDate: Date }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, weddingDate.getTime() - now);
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [weddingDate]);

  const items = [
    ["КҮН", time.days],
    ["СААТ", time.hours],
    ["МИНУТ", time.minutes],
    ["СЕКУНД", time.seconds],
  ];

  return (
    <div className="mx-auto grid max-w-[330px] grid-cols-4 gap-2 px-3">
      {items.map(([label, value]) => (
        <div key={String(label)} className="rounded-[8px] border border-[#caaa82]/60 bg-[#f7f0e4]/65 px-1 py-3 text-center">
          <div className="font-serif text-[21px] text-[#40372e]">{String(value).padStart(2, "0")}</div>
          <div className="mt-1 text-[8px] tracking-[0.08em] text-[#796a59]">{label}</div>
        </div>
      ))}
    </div>
  );
}

export function ElegantFamily({ kit }: { kit: LayoutKit }) {
  const { invitation } = kit;
  const [attendance, setAttendance] = useState("yes");
  const [drink, setDrink] = useState("");
  const [guests, setGuests] = useState("1");
  const [name, setName] = useState("");
  const [wishes, setWishes] = useState("");

  const weddingDate = new Date(invitation.date ? `${invitation.date}T${invitation.time || "17:00"}:00` : "2026-08-28T17:00:00");

  const timeline = [
    { time: "15:00", title: "Конокторду тосуу", subtitle: "Welcome-фуршет", icon: Coffee },
    { time: "15:30", title: "Нике кыюу", subtitle: "", icon: Gem },
    { time: "16:10", title: "Куттуктоолор", subtitle: "жана сүрөткө түшүү", icon: Camera },
    { time: "17:00", title: "Той ашы", subtitle: "", icon: Utensils },
    { time: "20:00", title: "Маданий программа", subtitle: "Бий, оюн-зоок", icon: Music2 },
    { time: "23:00", title: "Кеченин жыйынтыгы", subtitle: "", icon: Sparkles },
  ];

  return (
    <div className="overflow-x-hidden bg-[#f4ecdf] text-[#443a31]">
      {/* Hero section */}
      <section className="relative">
        <div className="absolute inset-x-0 top-0 z-10 h-[110px] bg-gradient-to-b from-[#f4ecdf] via-[#f4ecdf]/80 to-transparent" />
        <div className="absolute left-0 right-0 top-[41px] z-20 text-center text-[8px] tracking-[0.32em] text-[#73675b]">
          БИЗДИН ҮЙЛӨНҮҮ ҮЛПӨТҮ
        </div>

        <div className="h-[565px] overflow-hidden">
          <img src={invitation.coverImage || "/wedding/hero.jpg"} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="relative z-20 -mt-[150px] rounded-t-[50%_90px] bg-[#f4ecdf] px-6 pb-8 pt-14 text-center">
          <h1 className="font-serif text-[50px] leading-[0.85] text-[#26211d] italic">
            {invitation.names?.split("&")[0]?.trim() || "Азамат"}<span className="my-2 block text-[26px]">&</span>
            {invitation.names?.split("&")[1]?.trim() || "Айнери"}
          </h1>

          <p className="mt-7 font-serif text-[14px] tracking-[0.2em]">
            {invitation.date?.replace(/-/g, " · ") || "28 · 08 · 2026"}
          </p>

          <p className="mt-3 text-[8px] tracking-[0.25em] text-[#6d6257]">
            БИЗДИН ӨЗГӨЧӨ КҮНГӨ<br />
            ЧАКЫРАБЫЗ!
          </p>

          <div className="mt-6">
            <Countdown weddingDate={weddingDate} />
          </div>

          <div className="mt-7">
            <Ornament />
          </div>

          <h2 className="mt-5 font-serif text-[18px] tracking-[0.12em]">КЫРМАТТУУ<br />ДОСТОРУБУЗ!</h2>

          <p className="mx-auto mt-4 max-w-[300px] font-serif text-[13px] leading-[1.6]">
            {invitation.message || "Биздин жашообуздагы эң маанилүү күндүн сиздер менен бирге бөлүштүрүүгө кубанычтабыз! Сиздерди биздин үйлөнүү тоюбузга чакырабыз!"}
          </p>

          <div className="mt-7">
            <Ornament />
          </div>
        </div>
      </section>

      {/* Program section */}
      <section className="px-7 pb-12 pt-8">
        <h2 className="text-center font-serif text-[19px] tracking-[0.14em]">КҮНДҮН ПРОГРАММАСЫ</h2>
        <div className="mt-5 flex justify-center">
          <Ornament />
        </div>

        <div className="relative mx-auto mt-8 max-w-[285px]">
          <div className="absolute bottom-[22px] left-[26px] top-[22px] w-px bg-[#ad8b66]" />
          <div className="space-y-7">
            {timeline.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.time} className="relative grid grid-cols-[54px_1fr] items-center gap-4">
                  <div className="relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#a47f58] text-[#fff9ed]">
                    <Icon size={23} strokeWidth={1.35} />
                  </div>
                  <div>
                    <div className="font-serif text-[13px]">{item.time}</div>
                    <div className="mt-[3px] font-serif text-[12px] leading-[1.3]">{item.title}</div>
                    {item.subtitle && <div className="font-serif text-[11px] leading-[1.3]">{item.subtitle}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Venue section */}
      <section className="px-6 pb-11">
        <Ornament />
        <h2 className="mt-6 text-center font-serif text-[18px] tracking-[0.14em]">ӨТКӨРҮҮ ЖЕРИ</h2>
        <div className="mt-5 overflow-hidden rounded-[15px]">
          <img src="/wedding/venue.jpg" alt="" className="h-[190px] w-full object-cover" />
        </div>
        <div className="mt-4 text-center">
          <h3 className="font-serif text-[18px]">{invitation.venue || "«Ала-Тоо»"}</h3>
          <p className="mt-1 text-[10px] text-[#76695c]">Загородный комплекс</p>
          <div className="mt-3 flex items-center justify-center gap-2 font-serif text-[11px]">
            <MapPin size={15} className="text-[#a27b50]" />
            {invitation.address || "Ысык-Көл облусу"}
          </div>
          <button type="button" className="mt-5 flex h-[48px] w-full items-center justify-center gap-3 rounded-full bg-[#dfbd8d] font-serif text-[11px] tracking-[0.06em] transition hover:brightness-95">
            <Map size={17} />
            КАРТАДА КӨРҮҮ
          </button>
        </div>
      </section>

      {/* RSVP section */}
      <section className="border-t border-[#c8aa86]/30 px-7 py-11">
        <h2 className="text-center font-serif text-[18px] tracking-[0.13em]">КАТЫШУУҢУЗДУ<br />ЫРАСТАҢЫЗ</h2>
        <div className="mt-5">
          <Ornament />
        </div>

        <p className="mt-5 text-center font-serif text-[10px] leading-[1.5]">
          Сураныч, катышууңузду ырастайсыз. Бул биз үчүн абдан маанилүү!
        </p>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={() => setAttendance("yes")}
            className="flex w-full items-center gap-3 rounded-[9px] border border-[#c5aa8a]/55 bg-[#f8f2e9]/45 px-3 py-3 text-left"
          >
            <span className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border ${attendance === "yes" ? "border-[#365348] bg-[#365348] text-white" : "border-[#b9a68e]"}`}>
              {attendance === "yes" && <Check size={11} />}
            </span>
            <span className="font-serif text-[11px]">Ооба, келем</span>
          </button>

          <button
            type="button"
            onClick={() => setAttendance("no")}
            className="flex w-full items-center gap-3 rounded-[9px] border border-[#c5aa8a]/55 bg-[#f8f2e9]/45 px-3 py-3 text-left"
          >
            <span className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border ${attendance === "no" ? "border-[#365348] bg-[#365348] text-white" : "border-[#b9a68e]"}`}>
              {attendance === "no" && <Check size={11} />}
            </span>
            <span className="font-serif text-[11px]">Тилекке каршы, келе албайм</span>
          </button>
        </div>

        <label className="mt-6 block">
          <span className="mb-2 block font-serif text-[10px]">Сиздин аты-жөнүңүз жана фамилияңыз</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Мисалы: Эрланбек Темирбеков"
            className="h-[43px] w-full rounded-[7px] border border-[#c6ad8e]/50 bg-transparent px-3 font-serif text-[11px] outline-none placeholder:text-[#aa9d8e] focus:border-[#96714d]"
          />
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block font-serif text-[10px]">Коноктордун саны</span>
          <select value={guests} onChange={(e) => setGuests(e.target.value)} className="h-[43px] w-full rounded-[7px] border border-[#c6ad8e]/50 bg-transparent px-3 font-serif text-[11px] outline-none">
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} конок
              </option>
            ))}
          </select>
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block font-serif text-[10px]">Сиздин каалоо-тилектериңиз</span>
          <textarea
            rows={4}
            value={wishes}
            onChange={(e) => setWishes(e.target.value)}
            placeholder="Бизге каалоо-тилектериңизди жазыңыз..."
            className="w-full resize-none rounded-[7px] border border-[#c6ad8e]/50 bg-transparent p-3 font-serif text-[11px] outline-none placeholder:text-[#aa9d8e] focus:border-[#96714d]"
          />
        </label>

        <button type="button" className="mt-5 flex h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#30483e] text-[#f8f1e6] shadow-sm">
          <Send size={16} strokeWidth={1.5} />
          <span className="font-serif text-[11px] tracking-[0.1em]">ЖӨНӨТҮҮ</span>
        </button>
      </section>

      {/* Contacts section */}
      <section className="px-7 pb-11">
        <Ornament />
        <h2 className="mt-7 font-serif text-[17px] tracking-[0.12em]">БАЙЛАНЫШТАР</h2>
        <p className="mt-4 font-serif text-[10px]">Суроолоруңуз болсо, биз менен байланышыңыз!</p>
      </section>

      {/* Final message */}
      <section className="relative overflow-hidden px-7 pb-28 pt-5 text-center">
        <Ornament />
        <p className="mx-auto mt-8 max-w-[270px] font-serif text-[18px] italic leading-[1.45]">
          Бул кечени биз үчүн дагы<br />
          бирге бөлүшүүңүз үчүн<br />
          чын жүрөктөн күтөбүз!
        </p>
        <Heart className="mx-auto mt-6 fill-[#b08a65] text-[#b08a65]" size={20} />
        <svg viewBox="0 0 390 150" className="absolute bottom-0 left-0 w-full text-[#b79670]" fill="none">
          <path d="M0 137 L55 96 L79 111 L128 56 L155 87 L189 31 L230 86 L260 55 L295 91 L329 69 L390 127" stroke="currentColor" strokeWidth="1" opacity=".5" />
          <path d="M72 113 L128 56 L117 91 M128 56 L143 98 M151 88 L189 31 L178 78 M189 31 L213 77 M231 86 L260 55 L252 86 M260 55 L279 88" stroke="currentColor" strokeWidth=".8" opacity=".42" />
          <path d="M95 126 H303" stroke="currentColor" strokeWidth=".8" opacity=".5" />
          <path d="M145 125 V103 L190 86 L238 105 V125" stroke="currentColor" strokeWidth=".9" opacity=".55" />
        </svg>
        <p className="absolute bottom-7 left-0 right-0 text-[8px] tracking-[0.32em] text-[#92775c]">СҮЙҮҮ ТҮБӨЛҮК</p>
      </section>

      <div className="h-[40px] border-t border-[#c49f77]/30 bg-[radial-gradient(circle_at_10px_-5px,transparent_18px,#d4b990_19px,#d4b990_20px,transparent_21px)] bg-[length:38px_38px] opacity-50" />
    </div>
  );
}
