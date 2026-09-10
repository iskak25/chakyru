import type { Invitation, InvitationTemplate } from "./types";

export type ReferenceDesign = "silk" | "calligraphy" | "winter" | "mountains" | "sage" | "rose" | "burgundy" | "tuscany" | "stars";
export type ReferenceCrop = { source: string; width: number; height: number; x: number; y: number; w: number; h: number };
export type ReferenceWedding = {
  id: ReferenceDesign; title: string; names: string; date: string; venue: string; address: string;
  paper: string; ink: string; accent: string; colors: string[];
  photos: Record<string, ReferenceCrop>;
};
function crop(id: string, x: number, y: number, w: number, h: number): ReferenceCrop {
  return { source: `/images/wedding-references/${id}.jpg`, width: id === "rose" ? 852 : 736,
    height: id === "rose" ? 1515 : id === "tuscany" ? 981 : id === "calligraphy" ? 1003 : ["winter", "stars"].includes(id) ? 1104 : 1308, x, y, w, h };
}
export const referenceWeddings: ReferenceWedding[] = [
  { id: "silk", title: "Белый шёлк", names: "Артём & Анастасия", date: "2025-09-06", venue: "Место проведения", address: "город Феодосия, переулок Белый, 10", paper: "#ffffff", ink: "#65655f", accent: "#a4a59f", colors: ["#fff", "#d7d8d3", "#a3a5a0"], photos: {
    hero: crop("silk", 79, 498, 289, 392), couple: crop("silk", 436, 0, 244, 383), flowers: crop("silk", 438, 591, 241, 181), bottom: crop("silk", 76, 1194, 291, 113),
  } },
  { id: "calligraphy", title: "Нежная каллиграфия", names: "Анна & Вадим", date: "2024-08-10", venue: "Artiland | Загородный клуб", address: "Новское ш., 10, Балашиха, Московская обл.", paper: "#faf9f7", ink: "#171714", accent: "#dcbdb6", colors: ["#edd6d2", "#c4ada6", "#a5a798"], photos: {
    hero: crop("calligraphy", 68, 180, 304, 396), flowers: crop("calligraphy", 522, 376, 156, 57),
  } },
  { id: "winter", title: "Зимнее волшебство", names: "Ефим & Анастасия", date: "2025-12-12", venue: "Место проведения", address: "Зимний сад", paper: "#ffffff", ink: "#657182", accent: "#6e7e90", colors: ["#b9c8d6", "#252b35", "#b9d5c2", "#d1bea0", "#f0dfe5"], photos: {
    hero: crop("winter", 57, 244, 182, 188), chandelier: crop("winter", 73, 612, 153, 151), venue: crop("winter", 57, 823, 181, 130), flowers: crop("winter", 0, 986, 736, 118), arch: crop("winter", 493, 676, 181, 245), bow: crop("winter", 278, 192, 174, 114),
  } },
  { id: "mountains", title: "Свадьба в горах", names: "Мария & Евгений", date: "2026-08-08", venue: "Ресторан", address: "Банкетный зал", paper: "#ffffff", ink: "#33332e", accent: "#76503a", colors: ["#a59b96", "#71432b", "#343434"], photos: {
    hero: { source: "/images/wedding-references/mountains-hero-clean.png", width: 955, height: 1647, x: 0, y: 0, w: 955, h: 1647 }, collage: crop("mountains", 97, 674, 218, 172), table: crop("mountains", 422, 163, 81, 145), fashion: crop("mountains", 422, 454, 214, 114), couple: crop("mountains", 422, 740, 215, 171), footer: crop("mountains", 422, 1112, 215, 83), venue: crop("mountains", 174, 926, 119, 31),
  } },
  { id: "sage", title: "Шалфей и сердца", names: "Қарлығаш & Тұзақ", date: "2025-12-09", venue: "«Жасмин» мейрамханасы", address: "Шымкент қаласы", paper: "#ffffff", ink: "#2a3027", accent: "#91a286", colors: ["#91a286", "#526e47", "#e6e6d9"], photos: {
    hero: crop("sage", 79, 177, 287, 271), couple: crop("sage", 81, 775, 283, 266), hands: crop("sage", 426, 461, 251, 147), footer: crop("sage", 411, 1138, 285, 170),
  } },
  { id: "rose", title: "Пудровая роза", names: "Александр & Виктория", date: "2025-08-28", venue: "Загородный отель «Villa Love»", address: "Московская область, д. Лапино", paper: "#faf5ef", ink: "#433b37", accent: "#a47b82", colors: ["#e5cbb1", "#c6a3a3", "#a47b82", "#818669", "#2e2c29"], photos: {
    hero: crop("rose", 29, 109, 255, 397), hands: crop("rose", 29, 946, 255, 220), flowers: crop("rose", 29, 1348, 255, 166), venue: crop("rose", 305, 1058, 244, 195), footer: crop("rose", 568, 1389, 251, 124),
  } },
  { id: "burgundy", title: "Бордовый бархат", names: "Elena & Andrey", date: "2026-08-11", venue: "Ресторан Lumière", address: "г. Санкт-Петербург, ул. Кленовая, д. 17, лит. Б", paper: "#efeedb", ink: "#361c16", accent: "#60120f", colors: ["#60120f", "#c7c7c3"], photos: {
    hero: crop("burgundy", 147, 147, 147, 167), doors: crop("burgundy", 107, 409, 227, 170), venue: crop("burgundy", 420, 0, 191, 185), birds: crop("burgundy", 140, 890, 164, 96), envelope: crop("burgundy", 421, 891, 189, 238),
  } },
  { id: "tuscany", title: "Тоскана", names: "Алексей & Камила", date: "2025-08-10", venue: "VILLA DI LUSSO", address: "Via della bella vita, 1, Toscana, Italia", paper: "#f1e8db", ink: "#4a4031", accent: "#6c5739", colors: ["#e2d8cb", "#baa489", "#876744", "#211b16"], photos: {
    hero: crop("tuscany", 212, 345, 147, 199), story: crop("tuscany", 390, 130, 79, 108), villa: crop("tuscany", 386, 389, 148, 59), landscape: crop("tuscany", 213, 889, 144, 90), hotel: crop("tuscany", 385, 799, 150, 137), fashion: crop("tuscany", 583, 286, 101, 174),
  } },
  { id: "stars", title: "Под звёздами", names: "Ethan & Olivia", date: "2027-08-18", venue: "The Griffith Observatory", address: "2800 E Observatory Rd, Los Angeles, CA 90027", paper: "#151329", ink: "#f0eaf0", accent: "#cdb176", colors: ["#151329", "#cdb176", "#e3d8cc"], photos: {
    hero: { source: "/images/wedding-references/stars-hero-clean.png", width: 905, height: 1738, x: 0, y: 0, w: 905, h: 1738 }, collage: crop("stars", 290, 62, 155, 280), party: crop("stars", 505, 155, 151, 76), hands: crop("stars", 490, 355, 174, 108), footer: crop("stars", 490, 617, 174, 231),
  } },
];
export function referenceWedding(inv: Pick<Invitation, "templateId" | "copy">) {
  const key = inv.copy?.["reference.design"] || inv.templateId.replace(/^reference-/, "");
  return referenceWeddings.find(item => item.id === key);
}
export const referenceWeddingTemplates: InvitationTemplate[] = referenceWeddings.map(design => ({
  id: `reference-${design.id}`, name: { ru: design.title, ky: design.title }, designer: "Chakyru Studio", format: "site3d", priceSom: 590, eventTypes: ["wedding"],
  style: { bg: design.paper, panel: design.paper, pageBg: design.paper, accent: design.accent, text: design.ink, muted: design.accent, ornament: design.accent, pageLayout: "classic" },
  canvas: { names: design.names, date: design.date, time: "17:00", venue: design.venue, address: design.address, city: "", message: "", dressCode: "", mapUrl: "", coverImage: "", musicUrl: "", layout: {}, extras: [], gallery: {}, blockColors: {}, copy: { "reference.design": design.id } },
}));
