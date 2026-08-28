"use client";

import type { CanvasItem, Invitation, LayoutBox } from "@/lib/types";
import { deleteCanvasId } from "@/lib/canvasOps";
import { ANIMS, animClass } from "@/lib/anim";
import { StickerGlyph } from "@/lib/stickers";
import { CanvasText, type InvitePatch } from "./CanvasEdit";
import { FreeMove } from "./MoveCanvas";

export const PALETTE = [
  "#8d0c0c",
  "#4e0d11",
  "#ba4545",
  "#3d2314",
  "#c4a35e",
  "#f6efe4",
  "#8b3a46",
  "#c45c6a",
  "#faf6f0",
  "#1a1a1a",
];

export function paint(invitation: Invitation, id: string, fallback: string) {
  return invitation.blockColors?.[id] ?? fallback;
}

export function extraBox(index: number, size: "lg" | "md" | "sm" | "shape" | "sticker"): LayoutBox {
  const col = index % 3;
  const row = Math.floor(index / 3);
  if (size === "sticker") {
    return { x: 12 + col * 28, y: 12 + (row % 4) * 20, w: 24, h: 20, z: 32 };
  }
  if (size === "shape") return { x: 12 + col * 28, y: 16 + row * 8, w: 22, h: 8, z: 30 };
  if (size === "lg") return { x: 10, y: 18 + (index % 6) * 6, w: 80, h: 8, z: 30 };
  if (size === "md") return { x: 12, y: 20 + (index % 6) * 6, w: 76, h: 6, z: 30 };
  return { x: 14, y: 22 + (index % 6) * 6, w: 72, h: 5, z: 30 };
}

function ShapeGlyph({ shape, color }: { shape: string; color: string }) {
  if (shape === "circle") {
    return <div className="h-full w-full rounded-full" style={{ background: color }} />;
  }
  if (shape === "square") {
    return <div className="h-full w-full" style={{ background: color }} />;
  }
  if (shape === "triangle") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <polygon points="50,8 94,92 6,92" fill={color} />
      </svg>
    );
  }
  if (shape === "star") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <polygon
          points="50,4 61,38 98,38 68,58 79,92 50,72 21,92 32,58 2,38 39,38"
          fill={color}
        />
      </svg>
    );
  }
  if (shape === "heart") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path
          d="M50 88 C50 88 12 62 12 38 C12 22 24 12 36 12 C44 12 48 18 50 24 C52 18 56 12 64 12 C76 12 88 22 88 38 C88 62 50 88 50 88 Z"
          fill={color}
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="50" r="38" fill="none" stroke={color} strokeWidth="3" />
      <path
        d="M50 12c8 10 14 22 14 34 0 16-6 28-14 32-8-4-14-16-14-32 0-12 6-24 14-34Z"
        fill={color}
        opacity="0.7"
      />
    </svg>
  );
}

export function ExtraLayer({
  invitation,
  onChange,
  guestName,
  locale,
}: {
  invitation: Invitation;
  onChange?: InvitePatch;
  guestName?: string;
  locale: string;
}) {
  const extras = invitation.extras ?? [];
  const mapHref =
    (invitation.mapUrl ?? "").trim() ||
    `https://2gis.kg/search/${encodeURIComponent(
      [invitation.venue, invitation.address, invitation.city].filter(Boolean).join(" ") ||
        "Ала-Тоо, Бишкек",
    )}`;

  return (
    <>
      {extras.map((item) => (
        <FreeMove
          key={item.id}
          id={item.id}
          defaults={
            item.kind === "clipart"
              ? { x: 10, y: 6, w: 80, h: 42, z: 22 }
              : item.kind === "sticker"
                ? { x: 38, y: 20, w: 24, h: 22, z: 32 }
                : { x: 20, y: 20, w: 40, h: 8, z: 30 }
          }
        >
          <div className={`h-full w-full ${animClass(item.anim)}`}>
            <ExtraBody
              item={item}
              invitation={invitation}
              onChange={onChange}
              guestName={guestName}
              locale={locale}
              mapHref={mapHref}
            />
          </div>
        </FreeMove>
      ))}
    </>
  );
}

function ExtraBody({
  item,
  invitation,
  onChange,
  guestName,
  locale,
  mapHref,
}: {
  item: CanvasItem;
  invitation: Invitation;
  onChange?: InvitePatch;
  guestName?: string;
  locale: string;
  mapHref: string;
}) {
  function patchItem(partial: Partial<CanvasItem>) {
    onChange?.({
      extras: (invitation.extras ?? []).map((el) =>
        el.id === item.id ? { ...el, ...partial } : el,
      ),
    });
  }

  if (item.kind === "clipart" && item.src) {
    return (
      <img
        src={item.src}
        alt=""
        draggable={false}
        className="h-full w-full object-contain"
        style={{ mixBlendMode: "multiply" }}
      />
    );
  }
  if (item.kind === "sticker") {
    return (
      <div className="h-full w-full p-0.5">
        <StickerGlyph id={item.sticker || "flower"} color={item.color} />
      </div>
    );
  }
  if (item.kind === "shape") {
    return <ShapeGlyph shape={item.shape || "square"} color={item.color} />;
  }
  if (item.kind === "divider") {
    return (
      <div className="flex h-full items-center px-2">
        <div className="h-px w-full" style={{ background: item.color }} />
      </div>
    );
  }
  if (item.kind === "image" && item.src) {
    return (
      <div
        className="h-full w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${item.src})` }}
      />
    );
  }
  if (item.kind === "button") {
    return (
      <a
        href={item.url || "#"}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => {
          if (onChange) e.preventDefault();
        }}
        className="flex h-full items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ background: item.color }}
      >
        {item.text || (locale === "ru" ? "Кнопка" : "Баскыч")}
      </a>
    );
  }
  if (item.kind === "map") {
    return (
      <a
        href={mapHref}
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          window.open(mapHref, "_blank", "noopener,noreferrer");
        }}
        className="flex h-full items-center justify-center rounded-full text-sm font-semibold"
        style={{ background: item.color, color: "#f9fded" }}
      >
        {locale === "ru" ? "Карта" : "Карта"}
      </a>
    );
  }
  if (item.kind === "countdown") {
    return (
      <div
        className="flex h-full items-center justify-center gap-2 rounded-2xl text-white"
        style={{ background: item.color }}
      >
        <span className="text-sm tracking-wide">
          {invitation.date || "—"} · {invitation.time}
        </span>
      </div>
    );
  }

  const value =
    item.kind === "guestName"
      ? guestName || item.text || (locale === "ru" ? "Дорогой гость" : "Урматтуу конок")
      : item.text || "";
  const placeholder =
    item.kind === "guestName"
      ? locale === "ru"
        ? "Имя гостя"
        : "Коноктун аты"
      : locale === "ru"
        ? "Текст"
        : "Текст";

  return (
    <div className="flex h-full items-center justify-center px-1">
      {item.kind === "guestName" || !onChange ? (
        <p
          className="w-full text-center"
          style={{ color: item.color, fontSize: item.fontSize ?? 22 }}
        >
          {value}
        </p>
      ) : (
        <CanvasText
          value={item.text || ""}
          placeholder={placeholder}
          onChange={(v) => patchItem({ text: v })}
          className="text-center"
          style={{ color: item.color, fontSize: item.fontSize ?? 22 }}
        />
      )}
    </div>
  );
}

const ELEMENT_NAME: Record<string, { ky: string; ru: string }> = {
  names: { ky: "Ысымдар", ru: "Имена" },
  weddingDay: { ky: "THE WEDDING DAY", ru: "THE WEDDING DAY" },
  loveWord: { ky: "LOVE", ru: "LOVE" },
  loveQuote: { ky: "Цитата", ru: "Цитата" },
  loveQuote2: { ky: "Цитата", ru: "Цитата" },
  dearGuests: { ky: "Кайрылуу", ru: "Обращение" },
  message: { ky: "Текст", ru: "Текст" },
  eventDay: { ky: "Күн", ru: "День" },
  calendar: { ky: "Календар", ru: "Календарь" },
  address: { ky: "Дарек", ru: "Адрес" },
  city: { ky: "Шаар", ru: "Город" },
  venue: { ky: "Жер", ru: "Место" },
  map: { ky: "Карта", ru: "Карта" },
  countdown: { ky: "Таймер", ru: "Таймер" },
  started: { ky: "Башталды", ru: "Началось" },
  rsvpHint: { ky: "RSVP", ru: "RSVP" },
  rsvpYes: { ky: "Келем", ru: "Приду" },
  rsvpNo: { ky: "Келбейм", ru: "Не приду" },
  rsvpPlus: { ky: "+1", ru: "+1" },
  rsvpSend: { ky: "Жөнөтүү", ru: "Отправить" },
  wishes: { ky: "Каалоолор", ru: "Пожелания" },
  guestWishes: { ky: "Каалоолор", ru: "Пожелания" },
  guestsWord: { ky: "Коноктор", ru: "Гости" },
  allWishes: { ky: "Баары", ru: "Все" },
  hosts: { ky: "Ээлери", ru: "Хозяева" },
  inviteLine: { ky: "Чакыруу", ru: "Приглашение" },
  becomeFamily: { ky: "Үй-бүлө", ru: "Семья" },
  weWait: { ky: "Күтөбүз", ru: "Ждём" },
  youWord: { ky: "Сиз", ru: "Вас" },
  location: { ky: "Локация", ru: "Локация" },
  inviteTitle: { ky: "Тема", ru: "Заголовок" },
  weInvite: { ky: "Чакырабыз", ru: "Приглашаем" },
  seeYouSoon: { ky: "Көрүшкөнчө", ru: "До встречи" },
  respectShort: { ky: "Урматтоо", ru: "С уважением" },
  withLove: { ky: "Сүйүү менен", ru: "С любовью" },
  "photo-hero": { ky: "Сүрөт", ru: "Фото" },
  "photo-c0": { ky: "Сүрөт 1", ru: "Фото 1" },
  "photo-c1": { ky: "Сүрөт 2", ru: "Фото 2" },
  "photo-c2": { ky: "Сүрөт 3", ru: "Фото 3" },
  "photo-venue": { ky: "Банкет", ru: "Банкет" },
  "photo-circle": { ky: "Сүрөт", ru: "Фото" },
  "photo-rings": { ky: "Шаакек", ru: "Кольца" },
  "photo-flora": { ky: "Гүл", ru: "Цветы" },
  nameLine: { ky: "Сызык", ru: "Линия" },
  envelopeIcon: { ky: "Конверт", ru: "Конверт" },
  mapEmbed: { ky: "Карта", ru: "Карта" },
  blockHeader: { ky: "Блок", ru: "Блок" },
  blockRings: { ky: "Блок", ru: "Блок" },
  blockFamily: { ky: "Блок", ru: "Блок" },
  blockWait: { ky: "Блок", ru: "Блок" },
  blockCal: { ky: "Блок", ru: "Блок" },
  blockLocation: { ky: "Блок", ru: "Блок" },
  blockInvite: { ky: "Блок", ru: "Блок" },
  blockCollage: { ky: "Блок", ru: "Блок" },
  blockFooter: { ky: "Блок", ru: "Блок" },
  musicBtn: { ky: "Музыка", ru: "Музыка" },
  wishBtn: { ky: "Каалоо", ru: "Пожелание" },
};

function elementLabel(id: string | null, locale: string) {
  if (!id) return locale === "ru" ? "Фон" : "Фон";
  const named = ELEMENT_NAME[id];
  if (named) return locale === "ru" ? named.ru : named.ky;
  if (id.startsWith("photo-")) return locale === "ru" ? "Фото" : "Сүрөт";
  return locale === "ru" ? "Цвет" : "Түс";
}

export function ColorBar({
  selected,
  invitation,
  onChange,
  locale,
}: {
  selected: string | null;
  invitation: Invitation;
  onChange: InvitePatch;
  locale: string;
}) {
  const extra = (invitation.extras ?? []).find((e) => e.id === selected);
  const target = selected ?? "page";
  const color =
    extra?.color ?? invitation.blockColors?.[target] ?? (target === "page" ? "#f6efe4" : "#8d0c0c");

  function setColor(next: string) {
    if (extra) {
      onChange({
        extras: invitation.extras.map((el) =>
          el.id === extra.id ? { ...el, color: next } : el,
        ),
      });
      return;
    }
    onChange({
      blockColors: { ...(invitation.blockColors ?? {}), [target]: next },
    });
  }

  function setAnim(anim: string) {
    if (!extra) return;
    onChange({
      extras: invitation.extras.map((el) =>
        el.id === extra.id ? { ...el, anim: anim as typeof extra.anim } : el,
      ),
    });
  }

  function remove() {
    if (!selected) return;
    onChange(deleteCanvasId(invitation, selected));
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white px-3 py-2">
      <span className="max-w-[120px] truncate text-xs text-ink-soft">
        {elementLabel(selected, locale)}
      </span>
      {PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setColor(c)}
          className="h-6 w-6 rounded-full border border-black/10"
          style={{
            background: c,
            outline: color === c ? "2px solid #c4a35e" : undefined,
            outlineOffset: 1,
          }}
        />
      ))}
      <input
        type="color"
        value={color.length === 7 ? color : "#c5bd91"}
        onChange={(e) => setColor(e.target.value)}
        className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent"
      />
      {extra ? (
        <div className="flex w-full flex-wrap items-center justify-center gap-1 border-t border-ink/5 pt-2">
          {ANIMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAnim(item.id)}
              className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${
                (extra.anim || "none") === item.id
                  ? "bg-forest text-cream"
                  : "bg-black/5 text-ink-soft"
              }`}
            >
              {locale === "ru" ? item.ru : item.ky}
            </button>
          ))}
        </div>
      ) : null}
      {selected ? (
        <button
          type="button"
          onClick={remove}
          className="ml-1 rounded-full border border-rose/30 px-3 py-1 text-xs text-rose"
        >
          {locale === "ru" ? "Удалить" : "Өчүрүү"}
        </button>
      ) : null}
    </div>
  );
}
