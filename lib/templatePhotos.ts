export type TemplatePhotoSet = {
  hero: string;
  c0: string;
  c1: string;
  c2: string;
  venue: string;
};

const SETS: Record<string, TemplatePhotoSet> = {
  "ak-shumkar": { hero: "/images/hero-toi.jpg", c0: "/images/templates/ak-shumkar/c0.jpg", c1: "/images/templates/ak-shumkar/c1.jpg", c2: "", venue: "/images/templates/ak-shumkar/venue.jpg" },
  "elegant": { hero: "/images/templates/elegant/hero.jpg", c0: "/images/templates/elegant/c0.jpg", c1: "/images/templates/elegant/c1.jpg", c2: "", venue: "/images/templates/elegant/venue.jpg" },
  "tun-almaz": { hero: "/images/templates/tun-almaz/hero.jpg", c0: "/images/templates/tun-almaz/c0.jpg", c1: "/images/templates/tun-almaz/c1.jpg", c2: "", venue: "/images/templates/tun-almaz/venue.jpg" },
  "komur": { hero: "/images/collage-1.jpg", c0: "/images/templates/komur/c0.jpg", c1: "/images/templates/komur/c1.jpg", c2: "", venue: "/images/templates/komur/venue.jpg" },
  "ak-kara": { hero: "/images/templates/ak-kara/hero.jpg", c0: "/images/templates/ak-kara/c0.jpg", c1: "/images/templates/ak-kara/c1.jpg", c2: "", venue: "/images/templates/ak-kara/venue.jpg" },
  "veil-kun": { hero: "/images/templates/veil-kun/hero.jpg", c0: "/images/templates/veil-kun/c0.jpg", c1: "/images/templates/veil-kun/c1.jpg", c2: "", venue: "/images/templates/veil-kun/venue.jpg" },
  "atelier": { hero: "/images/templates/atelier/hero.jpg", c0: "/images/templates/atelier/c0.jpg", c1: "/images/templates/atelier/c1.jpg", c2: "", venue: "/images/templates/atelier/venue.jpg" },
  "klassika": { hero: "/images/templates/klassika/hero.jpg", c0: "/images/templates/klassika/c0.jpg", c1: "/images/templates/klassika/c1.jpg", c2: "", venue: "" },
  "ak-kyoshok": { hero: "/images/templates/ak-kyoshok/hero.jpg", c0: "/images/templates/ak-kyoshok/c0.jpg", c1: "/images/templates/ak-kyoshok/c1.jpg", c2: "", venue: "" },
  "tan-tuman": { hero: "/images/templates/tan-tuman/hero.jpg", c0: "/images/templates/tan-tuman/c0.jpg", c1: "/images/templates/tan-tuman/c1.jpg", c2: "", venue: "" },
  "altyn-kun": { hero: "/images/templates/altyn-kun/hero.jpg", c0: "/images/templates/altyn-kun/c0.jpg", c1: "/images/templates/altyn-kun/c1.jpg", c2: "", venue: "" },
  "mramor": { hero: "/images/templates/mramor/hero.jpg", c0: "/images/templates/mramor/c0.jpg", c1: "/images/templates/mramor/c1.jpg", c2: "", venue: "" },
  "ak-bilet": { hero: "/images/templates/ak-bilet/hero.jpg", c0: "/images/templates/ak-bilet/c0.jpg", c1: "/images/templates/ak-bilet/c1.jpg", c2: "", venue: "" },
  "modern-cream": { hero: "/images/templates/modern-cream/hero.jpg", c0: "/images/templates/modern-cream/c0.jpg", c1: "/images/templates/modern-cream/c1.jpg", c2: "", venue: "" },
  "zhas-shamal": { hero: "/images/templates/zhas-shamal/hero.jpg", c0: "/images/templates/zhas-shamal/c0.jpg", c1: "/images/templates/zhas-shamal/c1.jpg", c2: "", venue: "" },
  "jeek": { hero: "/images/collage-2.jpg", c0: "/images/collage-3.jpg", c1: "/images/templates/jeek/c1.jpg", c2: "", venue: "" },
  "nishan": { hero: "/images/templates/nishan/hero.jpg", c0: "/images/templates/ak-bilet/c2.jpg", c1: "/images/templates/nishan/c1.jpg", c2: "", venue: "" },
  "polaroid": { hero: "/images/templates/polaroid/hero.jpg", c0: "/images/templates/polaroid/c0.jpg", c1: "/images/templates/polaroid/c1.jpg", c2: "", venue: "" },
  "kyz-gulu": { hero: "/images/templates/ak-kara/c2.jpg", c0: "/images/templates/ak-kyoshok/c2.jpg", c1: "/images/templates/ak-shumkar/c2.jpg", c2: "", venue: "" },
  "jipek": { hero: "/images/templates/jipek/hero.jpg", c0: "/images/templates/jipek/c0.jpg", c1: "/images/templates/ala-too/c0.jpg", c2: "", venue: "" },
  "gul-zar": { hero: "/images/templates/gul-zar/hero.jpg", c0: "/images/templates/gul-zar/c0.jpg", c1: "/images/templates/ala-too/c1.jpg", c2: "", venue: "" },
  "romashka": { hero: "/images/templates/ala-too/hero.jpg", c0: "/images/templates/romashka/c0.jpg", c1: "/images/templates/romashka/c1.jpg", c2: "", venue: "" },
  "shai-gul": { hero: "/images/templates/shai-gul/hero.jpg", c0: "/images/templates/shai-gul/c0.jpg", c1: "/images/templates/shai-gul/c1.jpg", c2: "", venue: "" },
  "mak": { hero: "/images/templates/mak/hero.jpg", c0: "/images/templates/mak/c0.jpg", c1: "/images/templates/altin-jildiz/c0.jpg", c2: "", venue: "" },
  "baxmal": { hero: "/images/templates/baxmal/hero.jpg", c0: "/images/templates/baxmal/c0.jpg", c1: "/images/templates/altin-jildiz/c1.jpg", c2: "", venue: "" },
  "salt": { hero: "/images/templates/altyn-kun/c2.jpg", c0: "/images/templates/atelier/c2.jpg", c1: "/images/templates/salt/c1.jpg", c2: "", venue: "" },
  "altin-jildiz": { hero: "/images/templates/balalyk/hero.jpg", c0: "/images/templates/beshik-jyluu/c0.jpg", c1: "/images/templates/beshik-jyluu/c2.jpg", c2: "", venue: "" },
  "ramadan-nur": { hero: "/images/templates/ramadan-nur/hero.jpg", c0: "/images/templates/ramadan-nur/c0.jpg", c1: "/images/templates/ramadan-nur/c1.jpg", c2: "", venue: "" },
  "kok-too": { hero: "/images/templates/kok-too/hero.jpg", c0: "/images/templates/kok-too/c0.jpg", c1: "/images/templates/kok-too/c1.jpg", c2: "", venue: "" },
  "toi-kyzyl": { hero: "/images/templates/toi-kyzyl/hero.jpg", c0: "/images/templates/toi-kyzyl/c0.jpg", c1: "/images/templates/beshik-nur/hero.jpg", c2: "", venue: "" },
  "beshik-jyluu": { hero: "/images/templates/elegant/c2.jpg", c0: "/images/templates/iftar-table/c0.jpg", c1: "/images/templates/iftar-table/c1.jpg", c2: "", venue: "" },
  "shyrdak": { hero: "/images/templates/shyrdak/hero.jpg", c0: "/images/templates/shyrdak/c0.jpg", c1: "/images/templates/shyrdak/c1.jpg", c2: "", venue: "" },
  "zhai-tokoi": { hero: "/images/templates/zhai-tokoi/hero.jpg", c0: "/images/templates/zhai-tokoi/c0.jpg", c1: "/images/templates/zhai-tokoi/c1.jpg", c2: "", venue: "" },
  "ivory": { hero: "/images/templates/ivory/hero.jpg", c0: "/images/templates/ivory/c0.jpg", c1: "/images/templates/ivory/c1.jpg", c2: "", venue: "" },
  "mauve": { hero: "/images/templates/mauve/hero.jpg", c0: "/images/templates/mauve/c0.jpg", c1: "/images/templates/mauve/c1.jpg", c2: "", venue: "" },
  "beshik-nur": { hero: "/images/templates/ivory/c2.jpg", c0: "", c1: "", c2: "", venue: "" },
  "balalyk": { hero: "/images/templates/jipek/c2.jpg", c0: "", c1: "", c2: "", venue: "" },
  "ak-jooluk": { hero: "/images/templates/jubilee-gold/c0.jpg", c0: "", c1: "", c2: "", venue: "" },
  "shumkar-photo": { hero: "/images/templates/klassika/c2.jpg", c0: "", c1: "", c2: "", venue: "" },
  "minimal-white": { hero: "/images/templates/komur/c2.jpg", c0: "", c1: "", c2: "", venue: "" },
  "kyz-uzatuu-photo": { hero: "/images/templates/kyz-gulu/c2.jpg", c0: "", c1: "", c2: "", venue: "" },
  "zhuzum": { hero: "/images/templates/mak/c2.jpg", c0: "/images/templates/mauve/c2.jpg", c1: "/images/templates/zhuzum/c1.jpg", c2: "", venue: "" },
  "rosa": { hero: "/images/templates/midnight/c0.jpg", c0: "/images/templates/midnight/hero.jpg", c1: "/images/templates/modern-cream/c2.jpg", c2: "", venue: "" },
  "midnight": { hero: "/images/templates/mramor/c2.jpg", c0: "/images/templates/nishan/c2.jpg", c1: "/images/templates/ramadan-nur/c2.jpg", c2: "", venue: "" },
  "ala-too": { hero: "/images/templates/romashka/c2.jpg", c0: "/images/templates/salt/c2.jpg", c1: "/images/templates/shai-gul/c2.jpg", c2: "", venue: "" },
  "jubilee-gold": { hero: "/images/templates/tan-tuman/c2.jpg", c0: "/images/templates/toi-kyzyl/c2.jpg", c1: "/images/templates/tun-almaz/c2.jpg", c2: "", venue: "" },
  "iftar-table": { hero: "/images/templates/veil-kun/c2.jpg", c0: "/images/templates/zhai-tokoi/c2.jpg", c1: "/images/venue-table.jpg", c2: "", venue: "" },
};

export function getTemplatePhotos(templateId: string): TemplatePhotoSet {
  return SETS[templateId] ?? SETS.klassika!;
}

export function allTemplatePhotoSets() {
  return SETS;
}
