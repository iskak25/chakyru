/** Existing catalogue identifiers, with individual art direction and reference provenance. */
export const kyzRedesign = {
  'tulip-arch': { ref: 1, theme: 'garden', photo: 'kyz-unique-tulip-arch', order: 'intro,calendar,location,programme', decor: 'rose-flowers', paper: '#f3eee4', ink: '#344736' },
  'shyrdak-duet': { ref: 2, theme: 'torn', photo: 'kyz-unique-shyrdak-duet', order: 'intro,programme,calendar,location', decor: 'kyz-ethno-flower', paper: '#f9f8f3', ink: '#174f60' },
  'mother-letter': { ref: 3, theme: 'letter', photo: 'kyz-unique-mother-letter', order: 'intro,calendar,programme,location', decor: 'silk-flowers', paper: '#fbfaf6', ink: '#49443f' },
  'peony-banner': { ref: 7, theme: 'theatre', photo: 'kyz-unique-peony-banner', order: 'intro,location,programme,calendar', decor: 'rose-flowers', paper: '#f5c9cb', ink: '#28145b' },
  'pearl-seal': { ref: 4, theme: 'seal', photo: 'kyz-unique-pearl-seal', order: 'intro,calendar,location,programme', decor: 'silk-flowers', paper: '#f4f0e5', ink: '#777647' },
  'iris-garden': { ref: 7, theme: 'floral', photo: 'kyz-unique-iris-garden', order: 'intro,programme,location,calendar', decor: 'rose-footer', paper: '#f6e4ea', ink: '#593d66' },
  'lily-frame': { ref: 4, theme: 'mirror', photo: 'kyz-unique-lily-frame', order: 'intro,calendar,programme,location', decor: 'silk-bottom', paper: '#f6f5ee', ink: '#6f7351' },
  'tunduk-gate': { ref: 11, theme: 'threshold', photo: 'kyz-unique-tunduk-gate', order: 'intro,programme,calendar,location', decor: 'kyz-ethno-flower', paper: '#fffdf8', ink: '#6c573c' },
  'swallow-crest': { ref: 10, theme: 'azure', photo: 'kyz-unique-swallow-crest', order: 'programme,intro,calendar,location', decor: 'winter-flowers', paper: '#f9f6eb', ink: '#315f86' },
  'rose-terrace': { ref: 9, theme: 'cameo', photo: 'kyz-unique-rose-terrace', order: 'intro,calendar,location,programme', decor: 'rose-flowers', paper: '#f4d2d0', ink: '#654c45' },
  'silk-fold': { ref: 6, theme: 'sapphire', photo: 'kyz-unique-silk-fold', order: 'intro,calendar,programme,location', decor: 'winter-chandelier', paper: '#082c48', ink: '#e0c28d' },
  'moon-orbit': { ref: 6, extra: 'stars', theme: 'moon', photo: 'kyz-unique-moon-orbit', order: 'calendar,intro,location,programme', decor: 'winter-chandelier', paper: '#121b32', ink: '#ece0c6' },
  'memory-collage': { ref: 8, theme: 'album', photo: 'kyz-unique-memory-collage', order: 'intro,calendar,location,programme', decor: 'rose-footer', paper: '#fff4f8', ink: '#ae205b' },
  'orchid-window': { ref: 12, extra: 'winter', theme: 'ice', photo: 'kyz-unique-orchid-window', order: 'intro,location,programme,calendar', decor: 'winter-bow', paper: '#e9eff3', ink: '#45627a' },
  'ala-too-horizon': { ref: 1, extra: 'mountains', theme: 'landscape', photo: 'kyz-unique-ala-too-horizon', order: 'intro,location,calendar,programme', decor: 'tuscany-landscape', paper: '#f3eee5', ink: '#4a4937' },
  'poppy-type': { ref: 8, extra: 'calligraphy', theme: 'editorial', photo: 'kyz-unique-poppy-type', order: 'calendar,intro,programme,location', decor: 'calligraphy-flowers', paper: '#fff9f0', ink: '#9d2433' },
  'flower-post': { ref: 10, extra: 'rose', theme: 'postcard', photo: 'kyz-unique-flower-post', order: 'intro,location,calendar,programme', decor: 'rose-flowers', paper: '#f4ede1', ink: '#82555d' },
  'olive-columns': { ref: 5, theme: 'olive', photo: 'kyz-unique-olive-columns', order: 'intro,calendar,programme,location', decor: 'silk-flowers', paper: '#363e27', ink: '#f4f0dc' },
  'heritage-quilt': { ref: 2, extra: 'burgundy', theme: 'heritage', photo: 'kyz-unique-heritage-quilt', order: 'intro,programme,location,calendar', decor: 'kyz-ethno-flower', paper: '#6e1e2b', ink: '#f2e5cb' },
  'lotus-medal': { ref: 9, theme: 'heart', photo: 'kyz-unique-lotus-medal', order: 'intro,calendar,programme,location', decor: 'rose-footer', paper: '#fbf4ed', ink: '#97655d' },
  'spring-ticket': { ref: 10, extra: 'tuscany', theme: 'ticket', photo: 'kyz-unique-spring-ticket', order: 'calendar,location,intro,programme', decor: 'tuscany-villa', paper: '#e9dfcc', ink: '#54432c' },
  'fern-ribbon': { ref: 5, extra: 'sage', theme: 'ribbon', photo: 'kyz-unique-fern-ribbon', order: 'intro,programme,calendar,location', decor: 'silk-bottom', paper: '#e6e8d6', ink: '#41543e' },
  'petal-wave': { ref: 7, extra: 'rose', theme: 'petal', photo: 'kyz-unique-petal-wave', order: 'intro,location,programme,calendar', decor: 'rose-footer', paper: '#f1d8dc', ink: '#583a61' },
  'sun-stairs': { ref: 11, extra: 'tuscany', theme: 'sun', photo: 'kyz-unique-sun-stairs', order: 'intro,calendar,location,programme', decor: 'tuscany-landscape', paper: '#f1e5cc', ink: '#785f37' },
} as const;
export type KyzSlug = keyof typeof kyzRedesign;
export function kyzDirection(id: string) { return kyzRedesign[id.replace('collection-kyz-', '') as KyzSlug]; }
export const kyzAsset = (name: string) => `/images/template-restored/${name}.webp`;
