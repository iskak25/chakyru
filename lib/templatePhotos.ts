import { templateImageSource } from "./templateImageSources";

export type TemplatePhotoSet = {
  hero: string;
  c0: string;
  c1: string;
  c2: string;
  venue: string;
};

const SETS: Record<string, TemplatePhotoSet> = {
  "ak-shumkar": { hero: "/images/templates/ak-shumkar/hero.jpg", c0: "/images/templates/ak-shumkar/c0.jpg", c1: "/images/templates/ak-shumkar/c1.jpg", c2: "/images/templates/ak-shumkar/c2.jpg", venue: "/images/templates/ak-shumkar/venue.jpg" },
  "elegant": { hero: "/images/templates/elegant/hero.jpg", c0: "/images/templates/elegant/c0.jpg", c1: "/images/templates/elegant/c1.jpg", c2: "/images/templates/elegant/c2.jpg", venue: "/images/templates/elegant/venue.jpg" },
  "tun-almaz": { hero: "/images/templates/tun-almaz/hero.jpg", c0: "/images/templates/tun-almaz/c0.jpg", c1: "/images/templates/tun-almaz/c1.jpg", c2: "/images/templates/tun-almaz/c2.jpg", venue: "/images/templates/tun-almaz/venue.jpg" },
  "komur": { hero: "/images/templates/komur/hero.jpg", c0: "/images/templates/komur/c0.jpg", c1: "/images/templates/komur/c1.jpg", c2: "/images/templates/komur/c2.jpg", venue: "/images/templates/komur/venue.jpg" },
  "ak-kara": { hero: "/images/templates/ak-kara/hero.jpg", c0: "/images/templates/ak-kara/c0.jpg", c1: "/images/templates/ak-kara/c1.jpg", c2: "/images/templates/ak-kara/c2.jpg", venue: "/images/templates/ak-kara/venue.jpg" },
  "veil-kun": { hero: "/images/templates/veil-kun/hero.jpg", c0: "/images/templates/veil-kun/c0.jpg", c1: "/images/templates/veil-kun/c1.jpg", c2: "/images/templates/veil-kun/c2.jpg", venue: "/images/templates/veil-kun/venue.jpg" },
  "atelier": { hero: "/images/templates/atelier/hero.jpg", c0: "/images/templates/atelier/c0.jpg", c1: "/images/templates/atelier/c1.jpg", c2: "/images/templates/atelier/c2.jpg", venue: "/images/templates/atelier/venue.jpg" },
  "klassika": { hero: "/images/templates/klassika/hero.jpg", c0: "/images/templates/klassika/c0.jpg", c1: "/images/templates/klassika/c1.jpg", c2: "/images/templates/klassika/c2.jpg", venue: "" },
  "ak-kyoshok": { hero: "/images/templates/ak-kyoshok/hero.jpg", c0: "/images/templates/ak-kyoshok/c0.jpg", c1: "/images/templates/ak-kyoshok/c1.jpg", c2: "/images/templates/ak-kyoshok/c2.jpg", venue: "" },
  "tan-tuman": { hero: "/images/templates/tan-tuman/hero.jpg", c0: "/images/templates/tan-tuman/c0.jpg", c1: "/images/templates/tan-tuman/c1.jpg", c2: "/images/templates/tan-tuman/c2.jpg", venue: "" },
  "altyn-kun": { hero: "/images/templates/altyn-kun/hero.jpg", c0: "/images/templates/altyn-kun/c0.jpg", c1: "/images/templates/altyn-kun/c1.jpg", c2: "/images/templates/altyn-kun/c2.jpg", venue: "" },
  "mramor": { hero: "/images/templates/mramor/hero.jpg", c0: "/images/templates/mramor/c0.jpg", c1: "/images/templates/mramor/c1.jpg", c2: "/images/templates/mramor/c2.jpg", venue: "" },
  "ak-bilet": { hero: "/images/templates/ak-bilet/hero.jpg", c0: "/images/templates/ak-bilet/c0.jpg", c1: "/images/templates/ak-bilet/c1.jpg", c2: "/images/templates/ak-bilet/c2.jpg", venue: "" },
  "modern-cream": { hero: "/images/templates/modern-cream/hero.jpg", c0: "/images/templates/modern-cream/c0.jpg", c1: "/images/templates/modern-cream/c1.jpg", c2: "/images/templates/modern-cream/c2.jpg", venue: "" },
  "zhas-shamal": { hero: "/images/templates/zhas-shamal/hero.jpg", c0: "/images/templates/zhas-shamal/c0.jpg", c1: "/images/templates/zhas-shamal/c1.jpg", c2: "/images/templates/zhas-shamal/c2.jpg", venue: "" },
  "jeek": { hero: "/images/templates/jeek/hero.jpg", c0: "/images/templates/jeek/c0.jpg", c1: "/images/templates/jeek/c1.jpg", c2: "/images/templates/jeek/c2.jpg", venue: "" },
  "nishan": { hero: "/images/templates/nishan/hero.jpg", c0: "/images/templates/nishan/c0.jpg", c1: "/images/templates/nishan/c1.jpg", c2: "/images/templates/nishan/c2.jpg", venue: "" },
  "polaroid": { hero: "/images/templates/polaroid/hero.jpg", c0: "/images/templates/polaroid/c0.jpg", c1: "/images/templates/polaroid/c1.jpg", c2: "/images/templates/polaroid/c2.jpg", venue: "" },
  "kyz-gulu": { hero: "/images/templates/kyz-gulu/hero.jpg", c0: "/images/templates/kyz-gulu/c0.jpg", c1: "/images/templates/kyz-gulu/c1.jpg", c2: "/images/templates/kyz-gulu/c2.jpg", venue: "" },
  "jipek": { hero: "/images/templates/jipek/hero.jpg", c0: "/images/templates/jipek/c0.jpg", c1: "/images/templates/jipek/c1.jpg", c2: "/images/templates/jipek/c2.jpg", venue: "" },
  "gul-zar": { hero: "/images/templates/gul-zar/hero.jpg", c0: "/images/templates/gul-zar/c0.jpg", c1: "/images/templates/gul-zar/c1.jpg", c2: "/images/templates/gul-zar/c2.jpg", venue: "" },
  "romashka": { hero: "/images/templates/romashka/hero.jpg", c0: "/images/templates/romashka/c0.jpg", c1: "/images/templates/romashka/c1.jpg", c2: "/images/templates/romashka/c2.jpg", venue: "" },
  "shai-gul": { hero: "/images/templates/shai-gul/hero.jpg", c0: "/images/templates/shai-gul/c0.jpg", c1: "/images/templates/shai-gul/c1.jpg", c2: "/images/templates/shai-gul/c2.jpg", venue: "" },
  "mak": { hero: "/images/templates/mak/hero.jpg", c0: "/images/templates/mak/c0.jpg", c1: "/images/templates/mak/c1.jpg", c2: "/images/templates/mak/c2.jpg", venue: "" },
  "baxmal": { hero: "/images/templates/baxmal/hero.jpg", c0: "/images/templates/baxmal/c0.jpg", c1: "/images/templates/baxmal/c1.jpg", c2: "/images/templates/baxmal/c2.jpg", venue: "" },
  "salt": { hero: "/images/templates/salt/hero.jpg", c0: "/images/templates/salt/c0.jpg", c1: "/images/templates/salt/c1.jpg", c2: "/images/templates/salt/c2.jpg", venue: "" },
  "altin-jildiz": { hero: "/images/templates/altin-jildiz/hero.jpg", c0: "/images/templates/altin-jildiz/c0.jpg", c1: "/images/templates/altin-jildiz/c1.jpg", c2: "/images/templates/altin-jildiz/c2.jpg", venue: "" },
  "ramadan-nur": { hero: "/images/templates/ramadan-nur/hero.jpg", c0: "/images/templates/ramadan-nur/c0.jpg", c1: "/images/templates/ramadan-nur/c1.jpg", c2: "/images/templates/ramadan-nur/c2.jpg", venue: "" },
  "kok-too": { hero: "/images/templates/kok-too/hero.jpg", c0: "/images/templates/kok-too/c0.jpg", c1: "/images/templates/kok-too/c1.jpg", c2: "/images/templates/kok-too/c2.jpg", venue: "" },
  "toi-kyzyl": { hero: "/images/templates/toi-kyzyl/hero.jpg", c0: "/images/templates/toi-kyzyl/c0.jpg", c1: "/images/templates/toi-kyzyl/c1.jpg", c2: "/images/templates/toi-kyzyl/c2.jpg", venue: "" },
  "beshik-jyluu": { hero: "/images/templates/beshik-jyluu/hero.jpg", c0: "/images/templates/beshik-jyluu/c0.jpg", c1: "/images/templates/beshik-jyluu/c1.jpg", c2: "/images/templates/beshik-jyluu/c2.jpg", venue: "" },
  "shyrdak": { hero: "/images/templates/shyrdak/hero.jpg", c0: "/images/templates/shyrdak/c0.jpg", c1: "/images/templates/shyrdak/c1.jpg", c2: "/images/templates/shyrdak/c2.jpg", venue: "" },
  "zhai-tokoi": { hero: "/images/templates/zhai-tokoi/hero.jpg", c0: "/images/templates/zhai-tokoi/c0.jpg", c1: "/images/templates/zhai-tokoi/c1.jpg", c2: "/images/templates/zhai-tokoi/c2.jpg", venue: "" },
  "ivory": { hero: "/images/templates/ivory/hero.jpg", c0: "/images/templates/ivory/c0.jpg", c1: "/images/templates/ivory/c1.jpg", c2: "/images/templates/ivory/c2.jpg", venue: "" },
  "mauve": { hero: "/images/templates/mauve/hero.jpg", c0: "/images/templates/mauve/c0.jpg", c1: "/images/templates/mauve/c1.jpg", c2: "/images/templates/mauve/c2.jpg", venue: "" },
  "kyial": { hero: "/images/templates/kyial/hero.jpg", c0: "/images/templates/kyial/c0.jpg", c1: "/images/templates/kyial/c1.jpg", c2: "/images/templates/kyial/c2.jpg", venue: "/images/templates/kyial/venue.jpg" },
  "kyzyl-gul-anke": { hero: "/images/templates/kyzyl-gul-anke/hero.jpg", c0: "/images/templates/kyzyl-gul-anke/c0.jpg", c1: "/images/templates/kyzyl-gul-anke/c1.jpg", c2: "/images/templates/kyzyl-gul-anke/c2.jpg", venue: "/images/templates/kyzyl-gul-anke/venue.jpg" },
  "ak-tunuk": { hero: "/images/templates/ak-tunuk/hero.jpg", c0: "/images/templates/ak-tunuk/c0.jpg", c1: "/images/templates/ak-tunuk/c1.jpg", c2: "/images/templates/ak-tunuk/c2.jpg", venue: "/images/templates/ak-tunuk/venue.jpg" },
  "kyz-sham": { hero: "/images/templates/kyz-sham/hero.jpg", c0: "/images/templates/kyz-sham/c0.jpg", c1: "/images/templates/kyz-sham/c1.jpg", c2: "/images/templates/kyz-sham/c2.jpg", venue: "/images/templates/kyz-sham/venue.jpg" },
  "muzdak-nur": { hero: "/images/templates/muzdak-nur/hero.jpg", c0: "/images/templates/muzdak-nur/c0.jpg", c1: "/images/templates/muzdak-nur/c1.jpg", c2: "/images/templates/muzdak-nur/c2.jpg", venue: "/images/templates/muzdak-nur/venue.jpg" },
  "boz-talaa": { hero: "/images/templates/boz-talaa/hero.jpg", c0: "/images/templates/boz-talaa/c0.jpg", c1: "/images/templates/boz-talaa/c1.jpg", c2: "/images/templates/boz-talaa/c2.jpg", venue: "/images/templates/boz-talaa/venue.jpg" },
  "ak-dilda": { hero: "/images/templates/ak-dilda/hero.jpg", c0: "/images/templates/ak-dilda/c0.jpg", c1: "/images/templates/ak-dilda/c1.jpg", c2: "/images/templates/ak-dilda/c2.jpg", venue: "/images/templates/ak-dilda/venue.jpg" },
  "kara-sham": { hero: "/images/templates/kara-sham/hero.jpg", c0: "/images/templates/kara-sham/c0.jpg", c1: "/images/templates/kara-sham/c1.jpg", c2: "/images/templates/kara-sham/c2.jpg", venue: "/images/templates/kara-sham/venue.jpg" },
  "toskana-jel": { hero: "/images/templates/toskana-jel/hero.jpg", c0: "/images/templates/toskana-jel/c0.jpg", c1: "/images/templates/toskana-jel/c1.jpg", c2: "/images/templates/toskana-jel/c2.jpg", venue: "/images/templates/toskana-jel/venue.jpg" },
  "asman-jyldyz": { hero: "/images/templates/asman-jyldyz/hero.jpg", c0: "/images/templates/asman-jyldyz/c0.jpg", c1: "/images/templates/asman-jyldyz/c1.jpg", c2: "/images/templates/asman-jyldyz/c2.jpg", venue: "/images/templates/asman-jyldyz/venue.jpg" },
  "beshik-nur": { hero: "/images/templates/beshik-nur/hero.jpg", c0: "", c1: "", c2: "", venue: "" },
  "balalyk": { hero: "/images/templates/balalyk/hero.jpg", c0: "", c1: "", c2: "", venue: "" },
  "ak-jooluk": { hero: "/images/templates/ak-jooluk/hero.jpg", c0: "", c1: "", c2: "", venue: "" },
  "shumkar-photo": { hero: "/images/templates/shumkar-photo/hero.jpg", c0: "", c1: "", c2: "", venue: "" },
  "minimal-white": { hero: "/images/templates/minimal-white/hero.jpg", c0: "", c1: "", c2: "", venue: "" },
  "kyz-uzatuu-photo": { hero: "/images/templates/kyz-uzatuu-photo/hero.jpg", c0: "", c1: "", c2: "", venue: "" },
  "zhuzum": { hero: "/images/templates/zhuzum/hero.jpg", c0: "/images/templates/zhuzum/c0.jpg", c1: "/images/templates/zhuzum/c1.jpg", c2: "", venue: "" },
  "rosa": { hero: "/images/templates/rosa/hero.jpg", c0: "/images/templates/rosa/c0.jpg", c1: "/images/templates/rosa/c1.jpg", c2: "", venue: "" },
  "midnight": { hero: "/images/templates/midnight/hero.jpg", c0: "/images/templates/midnight/c0.jpg", c1: "/images/templates/midnight/c1.jpg", c2: "", venue: "" },
  "ala-too": { hero: "/images/templates/ala-too/hero.jpg", c0: "/images/templates/ala-too/c0.jpg", c1: "/images/templates/ala-too/c1.jpg", c2: "", venue: "" },
  "jubilee-gold": { hero: "/images/templates/jubilee-gold/hero.jpg", c0: "/images/templates/jubilee-gold/c0.jpg", c1: "/images/templates/jubilee-gold/c1.jpg", c2: "", venue: "" },
  "iftar-table": { hero: "/images/templates/iftar-table/hero.jpg", c0: "/images/templates/iftar-table/c0.jpg", c1: "/images/templates/iftar-table/c1.jpg", c2: "", venue: "" },
};

const resolvedSets = Object.fromEntries(Object.entries(SETS).map(([id, photos]) => [id, Object.fromEntries(Object.entries(photos).map(([slot, source]) => [slot, templateImageSource(source)])) as TemplatePhotoSet]));
export function getTemplatePhotos(templateId: string): TemplatePhotoSet {
  return resolvedSets[templateId] ?? resolvedSets.klassika!;
}

export function allTemplatePhotoSets() {
  return SETS;
}
