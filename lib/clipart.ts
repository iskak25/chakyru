export const CLIPART = [
  { id: "frame-wreath-leaves", src: "/stickers/frame-wreath-leaves.webp", group: "frame" as const },
  { id: "frame-circle-flowers", src: "/stickers/frame-circle-flowers.webp", group: "frame" as const },
  { id: "frame-oval-botanical", src: "/stickers/frame-oval-botanical.webp", group: "frame" as const },
  { id: "frame-square-floral", src: "/stickers/frame-square-floral.webp", group: "frame" as const },
  { id: "frame-heart-wreath", src: "/stickers/frame-heart-wreath.webp", group: "frame" as const },
  { id: "frame-laurel", src: "/stickers/frame-laurel.webp", group: "frame" as const },
  { id: "frame-arch-flowers", src: "/stickers/frame-arch-flowers.webp", group: "frame" as const },
  { id: "frame-corners", src: "/stickers/frame-corners.webp", group: "frame" as const },
  { id: "frame-ornate-round", src: "/stickers/frame-ornate-round.webp", group: "frame" as const },
  { id: "frame-diamond-floral", src: "/stickers/frame-diamond-floral.webp", group: "frame" as const },
  { id: "frame-crescent-flora", src: "/stickers/frame-crescent-flora.webp", group: "frame" as const },
  { id: "frame-peony-wreath", src: "/stickers/frame-peony-wreath.webp", group: "frame" as const },
  { id: "frame-pampas-oval", src: "/stickers/frame-pampas-oval.webp", group: "frame" as const },
  { id: "frame-bottom-flowers", src: "/stickers/frame-bottom-flowers.webp", group: "frame" as const },
  { id: "frame-side-vines", src: "/stickers/frame-side-vines.webp", group: "frame" as const },
  { id: "frame-gold-baroque", src: "/stickers/frame-gold-baroque.webp", group: "frame" as const },
  { id: "frame-hex-flowers", src: "/stickers/frame-hex-flowers.webp", group: "frame" as const },
  { id: "wedding-rings-gold", src: "/stickers/wedding-rings-gold.webp", group: "wedding" as const },
  { id: "wedding-rings-silver", src: "/stickers/wedding-rings-silver.png", group: "wedding" as const },
  { id: "wedding-cake", src: "/stickers/wedding-cake.png", group: "wedding" as const },
  { id: "wedding-couple", src: "/stickers/wedding-couple.png", group: "wedding" as const },
  { id: "wedding-couple-laurel", src: "/stickers/wedding-couple-laurel.png", group: "wedding" as const },
  { id: "wedding-bouquet", src: "/stickers/wedding-bouquet.webp", group: "wedding" as const },
  { id: "wedding-glasses", src: "/stickers/wedding-glasses.webp", group: "wedding" as const },
  { id: "wedding-doves", src: "/stickers/wedding-doves.webp", group: "wedding" as const },
  { id: "wedding-envelope", src: "/stickers/wedding-envelope.webp", group: "wedding" as const },
  { id: "wedding-bow", src: "/stickers/wedding-bow.webp", group: "wedding" as const },
  { id: "wedding-horseshoe", src: "/stickers/wedding-horseshoe.webp", group: "wedding" as const },
  { id: "wedding-lantern", src: "/stickers/wedding-lantern.webp", group: "wedding" as const },
  { id: "flora-rose", src: "/stickers/flora-rose.webp", group: "flora" as const },
  { id: "flora-eucalyptus", src: "/stickers/flora-eucalyptus.webp", group: "flora" as const },
  { id: "ornament-flourish", src: "/stickers/ornament-flourish.png", group: "ornament" as const },
];

export const CLIPART_GROUPS: {
  id: (typeof CLIPART)[number]["group"];
  ky: string;
  ru: string;
}[] = [
  { id: "frame", ky: "Рамкалар", ru: "Рамки" },
  { id: "wedding", ky: "Той", ru: "Свадьба" },
  { id: "flora", ky: "Гүлдөр", ru: "Цветы" },
  { id: "ornament", ky: "Оюулар", ru: "Орнамент" },
];
