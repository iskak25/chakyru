import { media } from "./media";

export type ShowcaseTemplate = "luxury" | "floral" | "editorial";

export type ShowcaseInvitation = {
  id: number;
  template: ShowcaseTemplate;
  bride: string;
  groom: string;
  date: string;
  hero: string;
};

export const showcaseInvitations: ShowcaseInvitation[] = [
  {
    id: 1,
    template: "luxury",
    bride: "Айгерим",
    groom: "Нурлан",
    date: "10.08.2026",
    hero: media.portraitA,
  },
  {
    id: 2,
    template: "floral",
    bride: "Арууке",
    groom: "Эрмек",
    date: "28.08.2026",
    hero: media.portraitB,
  },
  {
    id: 3,
    template: "editorial",
    bride: "Айгүл",
    groom: "Айбек",
    date: "14.09.2026",
    hero: "/images/editorial-couple.jpg",
  },
];
