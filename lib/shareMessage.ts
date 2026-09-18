import type { EventType, Invitation } from "./types";

const EVENT_PHRASE_KY: Record<EventType, string> = {
  toi: "тоюбузга",
  wedding: "үйлөнүү тоюбузга",
  kyz: "кыз узатуу тоюбузга",
  beshik: "бешик тоюбузга",
  anniversary: "юбилейлик майрамыбызга",
  iftar: "ифтар дасторконубузга",
  birthday: "туулган күн майрамыбызга",
  bachelorette: "кыздар кечебизге",
  jentek: "жентек тоюбузга",
  tushoo: "тушоо кесүү тоюбузга",
};

const EVENT_PHRASE_RU: Record<EventType, string> = {
  toi: "наш той",
  wedding: "нашу свадьбу",
  kyz: "той «Кыз узатуу»",
  beshik: "бешик той",
  anniversary: "юбилей",
  iftar: "ифтар",
  birthday: "день рождения",
  bachelorette: "девичник",
  jentek: "жентек той",
  tushoo: "тушоо той",
};

const KY_MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const RU_MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

function formatShareDate(date: string, locale: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || "");
  if (!m) return "";
  const day = Number(m[3]);
  const month = Number(m[2]) - 1;
  const name = (locale === "ru" ? RU_MONTHS : KY_MONTHS)[month];
  if (!name) return "";
  return locale === "ru" ? `${day} ${name}` : `${day}-${name}`;
}

type ShareInvitationInfo = Pick<Invitation, "eventType" | "names" | "date" | "time" | "venue" | "city">;

export function buildShareMessage(invitation: ShareInvitationInfo, locale: string, url: string): string {
  const ru = locale === "ru";
  const phrase = (ru ? EVENT_PHRASE_RU : EVENT_PHRASE_KY)[invitation.eventType] ?? (ru ? EVENT_PHRASE_RU.toi : EVENT_PHRASE_KY.toi);
  const venue = [invitation.venue, invitation.city].filter(Boolean).join(", ");
  const dateLine = formatShareDate(invitation.date, locale);

  // Only symbols made of a single UTF-16 code unit are used here (no 🎉-style surrogate-pair
  // emoji): WhatsApp/Telegram desktop on Windows can mangle surrogate pairs into "�" when handing
  // the shared text off from the browser to the app, while these single-unit symbols survive.
  const info = [
    dateLine ? `${ru ? "Дата" : "Күнү"}: ${dateLine}` : null,
    invitation.time ? `${ru ? "Время" : "Убактысы"}: ${invitation.time}` : null,
    venue ? `${ru ? "Место" : "Жери"}: ${venue}` : null,
  ].filter((line): line is string => Boolean(line));

  const blocks = ru
    ? [
        "✉️ Приглашение!",
        "Дорогой гость!",
        invitation.names || null,
        `Приглашаем Вас на ${phrase} от всего сердца ♡\nБудем рады разделить с Вами радость этого особенного дня и видеть Вас почётным гостем нашего праздника. ✨`,
        info.length ? info.join("\n") : null,
        `На странице приглашения Вы найдёте всю информацию о празднике и адрес.\nОткрыть приглашение →\n${url}`,
        "Ждём Вас! ♡",
      ]
    : [
        "✉️ Сизге чакыруу!",
        "Урматтуу конок!",
        invitation.names || null,
        `Сизди ${phrase} чын жүрөктөн чакырабыз ♡\nБул өзгөчө күндүн кубанычын сиз менен бирге бөлүшүп, майрамыбыздын кадырлуу коногу болушуңузду каалайбыз. ✨`,
        info.length ? info.join("\n") : null,
        `Чакыруу баракчасынан майрам тууралуу толук маалыматты жана даректи көрө аласыз.\nЧакырууну ачуу →\n${url}`,
        "Сизди күтөбүз! ♡",
      ];

  return blocks.filter((block): block is string => Boolean(block)).join("\n\n");
}
