export type StockPhoto = {
  id: string;
  thumb: string;
  src: string;
  alt: string;
  author: string;
};

export type StockPage = {
  items: StockPhoto[];
  page: number;
  source: "pexels" | "unsplash" | "openverse";
};

export const STOCK_CATEGORIES = [
  { id: "wedding", q: "elegant wedding photography", ky: "Той", ru: "Свадьба" },
  { id: "couple", q: "bride groom couple", ky: "Жубайлар", ru: "Пара" },
  { id: "flowers", q: "wedding flowers bouquet", ky: "Гүлдөр", ru: "Цветы" },
  { id: "gold", q: "gold aesthetic candle", ky: "Алтын", ru: "Золото" },
  { id: "nature", q: "soft nature landscape", ky: "Жаратылыш", ru: "Природа" },
  { id: "details", q: "wedding rings table setting", ky: "Деталдар", ru: "Детали" },
] as const;
