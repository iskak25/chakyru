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
    bride: "Анна",
    groom: "Вадим",
    date: "10.08.2024",
    hero: media.portraitA,
  },
  {
    id: 2,
    template: "floral",
    bride: "Виктория",
    groom: "Александр",
    date: "28.08.2025",
    hero: media.portraitB,
  },
  {
    id: 3,
    template: "editorial",
    bride: "София",
    groom: "Марк",
    date: "14.09.2025",
    hero: "/images/editorial-couple.jpg",
  },
];
