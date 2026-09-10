import type { Invitation, InvitationTemplate, InviteFormat } from "./types";
import type { ReferenceCrop } from "./referenceWeddings";

export type PinterestStyle = "ethno" | "burgundy" | "goldBride" | "pearl" | "blue" | "silkCard" | "nikahCard" | "monoCard" | "newspaper";
export type PinterestDesign = {
  key: PinterestStyle; id: string; pin: string; title: string; format: InviteFormat;
  paper: string; ink: string; accent: string; names: string; date: string; time: string;
  venue: string; address: string; photos: Record<string, ReferenceCrop>;
};
const raw = (pin: string, width: number, height: number, x: number, y: number, w: number, h: number): ReferenceCrop => ({ source: `/images/pinterest-references/${pin}.jpg`, width, height, x, y, w, h });
const clean = (file: string, width: number, height: number): ReferenceCrop => ({ source: `/images/pinterest-references/${file}-clean.png`, width, height, x: 0, y: 0, w: width, h: height });
export const pinterestDesigns: PinterestDesign[] = [
  { key: "ethno", id: "pin-kyz-ethno", pin: "720998221637252803", title: "Кыз узатуу — Этно", format: "site3d", paper: "#fffdf8", ink: "#864437", accent: "#a7563c", names: "Анель", date: "2026-04-25", time: "16:00", venue: "Той салтанаты", address: "Бишкек", photos: {
    hero: raw("720998221637252803",736,1308,60,215,275,400), hands: raw("720998221637252803",736,1308,416,312,283,160), women: raw("720998221637252803",736,1308,441,886,236,217), men: raw("720998221637252803",736,1308,442,1149,234,99), flower: raw("720998221637252803",736,1308,200,824,137,111),
  } },
  { key: "burgundy", id: "pin-kyz-burgundy", pin: "1065945805577372353", title: "Кыз узатуу — Камилла", format: "site3d", paper: "#f5eadd", ink: "#6b2b2b", accent: "#7d171c", names: "Камилла", date: "2026-06-06", time: "17:00", venue: "BEIS GRAND HALL", address: "Алматы қаласы, Ақбидай көшесі, 1А", photos: {
    hero: raw("1065945805577372353",736,1308,119,319,115,182), bride: raw("1065945805577372353",736,1308,41,610,160,153), hat: raw("1065945805577372353",736,1308,356,213,128,146), hands: raw("1065945805577372353",736,1308,252,454,104,141), yurt: raw("1065945805577372353",736,1308,503,320,141,131),
  } },
  { key: "goldBride", id: "pin-kyz-gold-bride", pin: "859061697710284875", title: "Кыз узатуу — Золотой орнамент", format: "site3d", paper: "#ffffff", ink: "#817363", accent: "#cbb872", names: "Жанару", date: "2025-06-15", time: "19:00", venue: "Grand Hall", address: "Ақтөбе қаласы, Сәңкібай батыр көшесі, 26І", photos: {
    hero: raw("859061697710284875",736,1308,23,225,218,252), footer: raw("859061697710284875",736,1308,494,872,216,228),
  } },
  { key: "pearl", id: "pin-kyz-pearl", pin: "159455643066435049", title: "Кыз узатуу — Шёлк и жемчуг", format: "site3d", paper: "#faf8ee", ink: "#50413c", accent: "#58433e", names: "Алуа", date: "2026-06-06", time: "16:00", venue: "«Иртыш» мейрамханасы", address: "Павлодар қаласы, Академик Бектұров көшесі, 79", photos: {
    silk: clean("gold",1024,1536), flower: raw("159455643066435049",736,1308,190,594,90,85), pearls: raw("159455643066435049",736,1308,403,401,257,67),
  } },
  { key: "blue", id: "pin-kyz-blue", pin: "8162843071272656", title: "Кыз узатуу — Синие орхидеи", format: "site3d", paper: "#ffffff", ink: "#141329", accent: "#0c0b24", names: "Айдана", date: "2025-10-25", time: "17:00", venue: "HYATT REGENCY", address: "Место проведения торжества", photos: {
    hero: raw("8162843071272656",736,1472,30,82,325,357), flowers: raw("8162843071272656",736,1472,377,140,164,124),
  } },
  { key: "silkCard", id: "pin-jpg-silk", pin: "1101130177700426062", title: "JPG — Шёлк и олива", format: "photo", paper: "#f2ebdd", ink: "#353b2b", accent: "#a17b37", names: "Lena & Emil", date: "2026-06-20", time: "17:00", venue: "", address: "", photos: { hero: clean("gold",1024,1536) } },
  { key: "nikahCard", id: "pin-jpg-nikah", pin: "1132514637566318009", title: "JPG — Никах", format: "photo", paper: "#eeeeed", ink: "#a67722", accent: "#946411", names: "Ринат & Лилия", date: "2026-04-24", time: "15:00", venue: "", address: "Серов урамы 4а адресы буенча", photos: { hero: clean("hands",939,1675) } },
  { key: "monoCard", id: "pin-jpg-monochrome", pin: "1120059369853155022", title: "JPG — Вместе за руку", format: "photo", paper: "#a4a4a4", ink: "#ffffff", accent: "#ffffff", names: "Malek & Rand", date: "2026-07-11", time: "20:30", venue: "ALSAKHRAH HALL", address: "", photos: { hero: clean("mono",941,1672) } },
  { key: "newspaper", id: "pin-jpg-newspaper", pin: "1146869861388231089", title: "JPG — Свадебная газета", format: "photo", paper: "#eeefec", ink: "#161714", accent: "#383a36", names: "Warner & Spencer", date: "2026-11-23", time: "10:00", venue: "", address: "123 Anywhere St, Any City", photos: { hero: raw("1146869861388231089",735,1029,326,252,408,616) } },
];
export function getPinterestDesign(inv: Pick<Invitation, "templateId" | "copy">) {
  return pinterestDesigns.find(d => d.id === inv.templateId || d.key === inv.copy?.["pinterest.design"]);
}
export const pinterestTemplates: InvitationTemplate[] = pinterestDesigns.map(d => ({
  id:d.id, name:{ru:d.title,ky:d.title}, designer:"Chakyru Studio", format:d.format, priceSom:d.format === "photo" ? 250 : 590, eventTypes:[d.format === "photo" ? "wedding" : "kyz"],
  style:{bg:d.paper,panel:d.paper,pageBg:d.paper,text:d.ink,accent:d.accent,muted:d.accent,ornament:d.accent,pageLayout:"classic"},
  canvas:{names:d.names,date:d.date,time:d.time,venue:d.venue,address:d.address,city:"",message:"",dressCode:"",mapUrl:"",coverImage:"",musicUrl:"",layout:{},extras:[],gallery:{},blockColors:{},copy:{"pinterest.design":d.key}},
}));
