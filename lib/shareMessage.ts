import type { EventType, Invitation } from "./types";
import { eventExamples } from "./collectionTemplates";

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
  corporate: "корпоративибизге",
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
  corporate: "корпоратив",
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

type ShareInvitationInfo = Pick<Invitation, "eventType" | "names" | "date" | "time" | "venue" | "city"> & { copy?: Invitation["copy"] };

/** Название торжества, которое владелец вписал в приглашение («Үйлөнүү той»), важнее типа шаблона: шаблон кыз узатуу может быть выбран под свадьбу. */
function eventTypeOf(invitation: ShareInvitationInfo): EventType {
  const title = invitation.copy?.eventTitle?.trim().toLowerCase();
  if (!title) return invitation.eventType;
  const match = Object.entries(eventExamples).find(([, example]) => example.title.some(name => name.toLowerCase() === title));
  return (match?.[0] as EventType | undefined) ?? invitation.eventType;
}

export function buildShareMessage(invitation: ShareInvitationInfo, locale: string, url: string, guestFull = ""): string {
  const guestName = guestFull.split("|")[0].trim();
  const ru = locale === "ru";
  const phrase = (ru ? EVENT_PHRASE_RU : EVENT_PHRASE_KY)[eventTypeOf(invitation)] ?? (ru ? EVENT_PHRASE_RU.toi : EVENT_PHRASE_KY.toi);
  const venue = [invitation.venue, invitation.city].filter(Boolean).join(", ");
  const dateLine = formatShareDate(invitation.date, locale);

  // No emoji here (neither 🎉-style surrogate pairs nor ✉️/✨ with a variation selector):
  // WhatsApp/Telegram desktop can mangle them into "�" when the shared text is handed off from
  // the browser to the app. Plain text symbols like ♡ and → survive.
  const info = [
    dateLine ? `${ru ? "Дата" : "Күнү"}: ${dateLine}` : null,
    invitation.time ? `${ru ? "Время" : "Убактысы"}: ${invitation.time}` : null,
    venue ? `${ru ? "Место" : "Жери"}: ${venue}` : null,
  ].filter((line): line is string => Boolean(line));

  const blocks = ru
    ? [
        "Приглашение!",
        guestName ? `Дорогой(ая) ${guestName}!` : "Дорогой гость!",
        invitation.names || null,
        `Приглашаем Вас на ${phrase} от всего сердца ♡\nБудем рады разделить с Вами радость этого особенного дня и видеть Вас почётным гостем нашего праздника.`,
        info.length ? info.join("\n") : null,
        `На странице приглашения Вы найдёте всю информацию о празднике и адрес.\nОткрыть приглашение →\n${url}`,
        "Ждём Вас! ♡",
      ]
    : [
        "Сизге чакыруу!",
        guestName ? `Урматтуу ${guestName}!` : "Урматтуу конок!",
        invitation.names || null,
        `Сизди ${phrase} чын жүрөктөн чакырабыз ♡\nБул өзгөчө күндүн кубанычын сиз менен бирге бөлүшүп, майрамыбыздын кадырлуу коногу болушуңузду каалайбыз.`,
        info.length ? info.join("\n") : null,
        `Чакыруу баракчасынан майрам тууралуу толук маалыматты жана даректи көрө аласыз.\nЧакырууну ачуу →\n${url}`,
        "Сизди күтөбүз! ♡",
      ];

  return blocks.filter((block): block is string => Boolean(block)).join("\n\n");
}
