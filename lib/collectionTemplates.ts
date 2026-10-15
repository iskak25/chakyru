import type { EventType, Invitation, InvitationTemplate, TemplateCanvas } from "./types";
import { kyzAsset, kyzDirection } from "./kyzRedesign";
import { weddingDirection } from "./weddingRedesign";
import { envelopeDesigns, type EnvelopeVariant } from "./envelopes";

export const catalogTargets = { wedding: 35, kyz: 30, tushoo: 12, anniversary: 10, beshik: 10, birthday: 10, jentek: 10, bachelorette: 10, corporate: 10, iftar: 5 } as const;
export type CollectionEvent = keyof typeof catalogTargets;
export type Composition = "arch" | "duet" | "letter" | "banner" | "seal" | "botanical" | "frame" | "gate" | "crest" | "terrace" | "fold" | "orbit" | "collage" | "window" | "landscape" | "type" | "postcard" | "columns" | "quilt" | "medallion" | "ticket" | "ribbon" | "wave" | "stairs";
export type Motif = "peony" | "tulip" | "olive" | "lily" | "rose" | "cotton" | "iris" | "poppy" | "orchid" | "lotus" | "fern" | "daisy" | "gypsophila" | "waxSeal" | "ornament" | "tunduk" | "mountain" | "swallow" | "ribbon" | "pearl" | "steps" | "balloon" | "kite" | "rainbow" | "train" | "cradle" | "moon" | "cloud" | "star" | "house" | "sprout" | "nest" | "sun" | "gift" | "cake" | "confetti" | "bow" | "fan" | "cherry" | "pine" | "snow" | "bauble" | "skyline" | "lantern" | "geometry" | "dates";
const palettes = {
  ivory: ["#faf6ed", "#353b30", "#677953", "#e3e7d8"],
  rose: ["#fbefec", "#633c46", "#975467", "#ecd0d0"],
  wine: ["#481d2c", "#fff1de", "#e1b892", "#663346"],
  blue: ["#eff4f8", "#243f60", "#58799b", "#d2e1ed"],
  ink: ["#1d2532", "#f8f1de", "#d6b77f", "#354154"],
  clay: ["#fcf2e6", "#643b2d", "#aa5c3e", "#eed2b8"],
  lilac: ["#f4f0fa", "#514267", "#88719e", "#ded3e9"],
  mint: ["#edf6ef", "#304e44", "#578477", "#cfe4d9"],
  gold: ["#fff8e9", "#564025", "#937037", "#f0dfb8"],
  pearl: ["#f7f4ee", "#34302b", "#9b8466", "#e9e2d6"],
  noir: ["#202021", "#f4ede3", "#d6b892", "#393737"],
  cherry: ["#fff1e9", "#762938", "#b44157", "#f6ccd1"],
  sky: ["#eef7fa", "#274958", "#527c8b", "#cde4ed"],
} as const;
type Palette = keyof typeof palettes;
type Brief = readonly [slug: string, ky: string, ru: string, composition: Composition, motif: Motif, palette: Palette, photo?: string];
export type CollectionSkin = "kyz-wax" | "kyz-burgundy" | "kyz-letter";
export type CollectionDesign = { id: string; event: CollectionEvent; name: { ky: string; ru: string }; composition: Composition; motif: Motif; paper: string; ink: string; accent: string; wash: string; photo?: string; skin?: CollectionSkin };

// Each brief pairs a spatial composition with a different illustrated idea.
// Art is original SVG; editable words never form part of an image.
const briefs: Record<CollectionEvent, readonly Brief[]> = {
  wedding: [
    ["olive-vow", "Зайтун багындагы ант", "Клятва в оливковом саду", "duet", "olive", "ivory"],
    ["peony-arch", "Ак гүлдөрдүн аркасы", "Облако гипсофилы", "arch", "gypsophila", "ivory"],
    ["silk-letter", "LOVE&sea — деңиз жээгиндеги сүйүү", "LOVE&sea · У моря", "letter", "ribbon", "blue"],
    ["night-orbit", "Жылдыздарга сапар", "Destination · Navy", "orbit", "star", "ink"],
    ["tunduk-union", "Бир түндүк", "Под одним түндүком", "crest", "tunduk", "gold"],
    ["lily-gate", "Бермет аркасы", "Арка из жемчуга", "gate", "pearl", "gold"],
    ["our-pictures", "Биздин көз ирмем", "Наше мгновение", "collage", "pearl", "clay", "/images/template-restored/silk-couple.webp"],
    ["mountain-vow", "Тоолор күбө", "Горы — наши свидетели", "landscape", "mountain", "sky"],
    ["rose-seal", "Сүйүү мөөрү", "Печать любви", "seal", "rose", "wine"],
    ["fern-window", "Жашыл терезе", "Зелёное окно", "window", "fern", "mint"],
    ["type-love", "Эки жүрөк — бир жол", "Два сердца — один путь", "type", "bow", "noir"],
    ["swallow-post", "Сүйүү кабары", "Весть о любви", "postcard", "swallow", "blue"],
    ["garden-terrace", "Назик гипсофила", "Нежная гипсофила", "terrace", "gypsophila", "rose"],
    ["lotus-fold", "Ак лотос", "Белый лотос", "fold", "lotus", "lilac"],
  ],
  kyz: [
    ["tulip-arch", "Жоогазын жол", "Дорога тюльпанов", "arch", "tulip", "rose"],
    ["shyrdak-duet", "Шырдак сыры", "История шырдака", "duet", "ornament", "clay"],
    ["mother-letter", "Эненин каты", "Письмо мамы", "letter", "cotton", "ivory"],
    ["peony-banner", "Бордовый кеч", "Бордовый вечер", "banner", "peony", "wine"],
    ["pearl-seal", "Мөөр басылган чакыруу", "Письмо с сургучной печатью", "seal", "waxSeal", "gold"],
    ["iris-garden", "Ирис багы", "Сад ирисов", "botanical", "iris", "lilac"],
    ["lily-frame", "Ак лилия", "Белая лилия", "frame", "lily", "mint"],
    ["tunduk-gate", "Ак босого", "Светлый порог", "gate", "tunduk", "clay"],
    ["swallow-crest", "Карлыгач канаты", "Крыло ласточки", "crest", "swallow", "blue"],
    ["rose-terrace", "Роза террасасы", "Терраса роз", "terrace", "rose", "rose"],
    ["silk-fold", "Жибек бүктөм", "Складки шёлка", "fold", "ribbon", "gold"],
    ["moon-orbit", "Айдай сулуу", "Лунная красота", "orbit", "moon", "ink"],
    ["memory-collage", "Кыздын альбому", "Альбом невесты", "collage", "bow", "rose", "/images/templates/kyz-uzatuu-photo/hero-themed.webp"],
    ["orchid-window", "Орхидея терезеси", "Окно орхидей", "window", "orchid", "blue"],
    ["ala-too-horizon", "Ала-Тоо кызы", "Дочь Ала-Тоо", "landscape", "mountain", "ivory"],
    ["poppy-type", "Кызгалдак", "Алый мак", "type", "poppy", "cherry"],
    ["flower-post", "Гүлдүү кат", "Цветочное письмо", "postcard", "daisy", "lilac"],
    ["olive-columns", "Назик бутак", "Нежная ветвь", "columns", "olive", "mint"],
    ["heritage-quilt", "Курак тилек", "Лоскутное пожелание", "quilt", "ornament", "wine"],
    ["lotus-medal", "Назик лотос", "Нежный лотос", "medallion", "lotus", "rose"],
    ["spring-ticket", "Жазга жолдомо", "Билет в весну", "ticket", "tulip", "clay"],
    ["fern-ribbon", "Жашыл жибек", "Зелёный шёлк", "ribbon", "fern", "ivory"],
    ["petal-wave", "Гүл толкуну", "Волна лепестков", "wave", "peony", "lilac"],
    ["sun-stairs", "Жаркын келечек", "Светлое будущее", "stairs", "sun", "gold"],
  ],
  tushoo: [
    ["first-path", "Алгачкы издер", "Первые следы", "stairs", "steps", "mint"],
    ["rainbow-road", "Тоолордун баласы", "Малыш гор", "arch", "rainbow", "sky"],
    ["little-traveler", "Гүлдүү шарлар", "Цветы и шары", "ticket", "train", "rose"],
    ["kite-flight", "Комуздун үнү", "Звуки комуза", "duet", "kite", "cherry"],
    ["sunny-step", "Көк жана алтын", "Синее и золото", "orbit", "sun", "blue"],
    ["balloon-flight", "Назик бакча", "Нежный сад", "banner", "balloon", "ivory"],
    ["step-album", "Таңкы күн", "Восход солнца", "window", "steps", "gold", "/images/templates/tushoo-ayat/hero.webp"],
    ["garden-run", "Жылуу жыгач", "Тёплое дерево", "botanical", "daisy", "clay"],
    ["step-ribbon", "Аюу жана шарлар", "Мишка и шарики", "ribbon", "steps", "mint"],
    ["mountain-kid", "Белектер күнү", "День подарков", "landscape", "kite", "rose"],
  ],
  anniversary: [
    ["gold-number", "Алтын курак", "Золотой возраст", "type", "olive", "gold"],
    ["life-chapters", "Өмүр барактары", "Главы жизни", "columns", "fern", "ivory"],
    ["family-medal", "Үй-бүлө сыймыгы", "Гордость семьи", "medallion", "ornament", "wine"],
    ["portrait-gallery", "Кадырлуу адам", "Дорогой человек", "duet", "pearl", "pearl", "/images/anniversary/portrait.webp"],
    ["velvet-ticket", "Өзгөчө кечеге билет", "Билет на особенный вечер", "ticket", "star", "ink"],
    ["autumn-letter", "Жылуу эскерүү", "Тёплые воспоминания", "letter", "rose", "clay"],
    ["mountain-years", "Бийик белес", "Высокий рубеж", "terrace", "mountain", "blue"],
    ["garden-jubilee", "Гүлдөй өмүр", "Цветущая жизнь", "frame", "peony", "lilac"],
  ],
  beshik: [
    ["moon-cradle", "Айлуу бешик", "Лунная колыбель", "arch", "cradle", "blue"],
    ["cotton-lullaby", "Жумшак бешик ыры", "Нежная колыбельная", "duet", "cotton", "ivory"],
    ["heritage-cradle", "Оймолуу бешик", "Резная колыбель", "crest", "cradle", "clay"],
    ["cloud-canopy", "Булут парда", "Облачный полог", "gate", "cloud", "sky"],
    ["star-lullaby", "Жылдыздуу түн", "Звёздная колыбельная", "orbit", "cradle", "ink"],
    ["soft-quilt", "Жумшак жууркан", "Мягкое одеяльце", "quilt", "cotton", "rose"],
    ["moon-window", "Ай терезеси", "Лунное окно", "window", "moon", "lilac"],
    ["cradle-letter", "Бешик батасы", "Благословение колыбели", "letter", "ornament", "gold"],
    ["cradle-ribbon", "Бешик боосу", "Лента колыбели", "ribbon", "cradle", "mint"],
  ],
  birthday: [
    ["candle-wish", "Шамдагы тилек", "Желание при свечах", "type", "cake", "cherry"],
    ["balloon-arch", "Шарлар майрамы", "Праздник воздушных шаров", "arch", "balloon", "sky"],
    ["confetti-ticket", "Көңүлдүү билет", "Билет на веселье", "ticket", "confetti", "lilac"],
    ["rainbow-fold", "Жети түс", "Семь цветов", "fold", "rainbow", "mint"],
    ["night-birthday", "Түнкү жаркыроо", "Ночное сияние", "banner", "star", "noir"],
    ["gift-post", "Күтүлгөн белек", "Долгожданный подарок", "postcard", "gift", "rose"],
    ["cherry-picnic", "Алчалуу пикник", "Вишнёвый пикник", "quilt", "cherry", "cherry"],
    ["sun-birthday", "Менин күнүм", "Мой день", "medallion", "sun", "gold"],
    ["portrait-party", "Өзгөчө көз ирмем", "Особенный момент", "collage", "confetti", "blue", "/images/anniversary/portrait.webp"],
    ["kite-party", "Кыялга карай", "Навстречу мечте", "stairs", "kite", "clay"],
  ],
  jentek: [
    ["welcome-home", "Үйүбүзгө кош келдиң", "Добро пожаловать домой", "gate", "house", "clay"],
    ["new-sprout", "Жаңы бүчүр", "Новый росток", "botanical", "sprout", "mint"],
    ["warm-nest", "Жылуу уя", "Тёплое гнёздышко", "medallion", "nest", "ivory"],
    ["good-news", "Сүйүнчү кат", "Письмо с доброй вестью", "postcard", "swallow", "rose"],
    ["family-sun", "Үйдүн нуру", "Солнышко семьи", "window", "sun", "gold"],
    ["family-quilt", "Үй-бүлө жылуулугу", "Семейное тепло", "quilt", "house", "blue"],
    ["little-leaf", "Өмүрдүн уландысы", "Продолжение жизни", "fold", "sprout", "ivory"],
    ["joy-letter", "Кубаныч бөлүшөлү", "Разделим нашу радость", "letter", "gift", "lilac"],
    ["new-dawn", "Жаңы таң", "Новый рассвет", "landscape", "nest", "sky"],
  ],
  bachelorette: [
    ["cherry-night", "Алча кечеси", "Вишнёвый вечер", "type", "cherry", "cherry"],
    ["bow-ticket", "Курбуларга билет", "Билет для подруг", "ticket", "bow", "rose"],
    ["orchid-duet", "Орхидея кечеси", "Вечер орхидей", "duet", "orchid", "lilac"],
    ["secret-letter", "Курбулар сыры", "Секреты подруг", "letter", "pearl", "ivory"],
    ["fan-dance", "Желпигич бийи", "Танец вееров", "banner", "fan", "wine"],
    ["ribbon-party", "Күлгүн бантик", "Розовый бант", "ribbon", "bow", "cherry"],
    ["moon-party", "Айлуу жолугушуу", "Встреча при луне", "terrace", "moon", "ink"],
    ["garden-friends", "Курбулар бакчасы", "Сад подруг", "frame", "tulip", "mint"],
  ],
  corporate: [
    ["pine-gala", "Карагай жыты", "Аромат хвои", "botanical", "pine", "mint"],
    ["snow-invite", "Карлуу чакыруу", "Снежное приглашение", "postcard", "snow", "blue"],
    ["bauble-gala", "Жаңы жыл жаркыроосу", "Новогоднее сияние", "orbit", "bauble", "wine"],
    ["winter-ticket", "Майрамга жолдомо", "Пропуск на праздник", "ticket", "pine", "gold"],
    ["team-horizon", "Бир команда", "Одна команда", "columns", "skyline", "ink"],
    ["achievement-fold", "Ийгилик кечеси", "Вечер достижений", "fold", "star", "noir"],
  ],
  iftar: [
    ["quiet-lantern", "Кечки чырак", "Вечерний фонарь", "arch", "lantern", "gold"],
    ["moon-table", "Айлуу дасторкон", "Дастархан при луне", "medallion", "moon", "ink"],
    ["geometric-peace", "Береке оймосу", "Узор благополучия", "frame", "geometry", "mint"],
    ["date-palm", "Курма бутагы", "Ветвь финиковой пальмы", "columns", "dates", "clay"],
    ["open-gate", "Ынтымак дасторкону", "Дастархан согласия", "gate", "geometry", "ivory"],
  ],
};

export const eventExamples: Record<CollectionEvent, { title: [string, string]; names: string; message: [string, string]; time: string }> = {
  wedding: { title: ["Үйлөнүү той", "Свадьба"], names: "Өмүрбек & Үмүт", time: "17:00", message: ["Урматтуу туугандар жана достор! Жаңы турмушка кадам таштаган күнүбүздө жаныбызда болуп, үйлөнүү тоюбуздун кадырлуу коногу болуңуздар. Кубанычыбызды сиздер менен бөлүшкүбүз келет!", "Дорогие родные и друзья! Приглашаем вас разделить радость нашей свадьбы. Будем счастливы видеть вас рядом в день рождения нашей семьи!"] },
  kyz: { title: ["Кыз узатуу", "Кыз узатуу"], names: "Айпери", time: "17:00", message: ["Урматтуу жакындарыбыз! Кызыбыздын жаңы турмушка аттанган күнүндө ак батаңызды берип, кыз узатуу тоюбузга келип кетиңиздер. Бул жылуу кечеде сиздерди күтөбүз!", "Дорогие близкие! Приглашаем вас на проводы нашей дочери. Разделите с нами этот трогательный вечер и подарите ей ваши добрые пожелания!"] },
  tushoo: { title: ["Тушоо той", "Тушоо той"], names: "Эрмек", time: "12:00", message: ["Урматтуу туугандар! Наристебиздин алгачкы кадамдарына күбө болуп, тушоо тоюбузга келиңиздер. Бөбөгүбүзгө ак жол тилеп, кубанычыбызды бирге бөлүшөлү!", "Дорогие родные! Приглашаем вас на праздник первых шагов нашего малыша. Давайте вместе пожелаем ему счастливого пути!"] },
  anniversary: { title: ["Маараке", "Юбилей"], names: "Өмүрбек", time: "18:00", message: ["Урматтуу туугандар, достор! Сиздерди мааракеме чакырам. Өмүрдүн ушул белесин жакындарым менен жылуу маектешип, жагымдуу эскерүүлөргө бөлөп өткөргүм келет. Кадырлуу коногум болуңуздар!", "Дорогие родные и друзья! Приглашаю вас на мой юбилей. Хочу встретить этот рубеж в кругу близких, за тёплой беседой и добрыми воспоминаниями."] },
  beshik: { title: ["Бешик той", "Бешик той"], names: "Нурайым", time: "13:00", message: ["Урматтуу жакындарыбыз! Наристебизди бешикке бөлөө салтанатына чакырабыз. Ак батаңызды берип, наристебиздин бешик тоюнда төрүбүздүн көркү болуңуздар!", "Дорогие близкие! Приглашаем вас на праздник укладывания нашего малыша в колыбель. Будем рады вашим благословениям и тёплым пожеланиям малышу!"] },
  birthday: { title: ["Туулган күн", "День рождения"], names: "Арууке", time: "16:00", message: ["Сүйүктүү жакындарым жана досторум! Туулган күнүмө келиңиздер. Жылуу сөздөр, күлкү жана жагымдуу жолугушуулар менен бул күндү бирге эстен кеткис өткөрөлү!", "Любимые близкие и друзья! Приглашаю вас на мой день рождения. Пусть этот день наполнится улыбками, тёплыми словами и приятными встречами!"] },
  jentek: { title: ["Жентек той", "Жентек той"], names: "Нурдөөлөт", time: "13:00", message: ["Сүйүнчү! Үй-бүлөбүзгө уулубуз Нурдөөлөт кошулду. Наристебиздин жарык дүйнөгө келишине арналган жентек тоюбузга чакырабыз. Сүйүнүчүбүздү бөлүшүп, жылуу дасторконубузга келиңиздер!", "В нашей семье радостная новость — родился сын Нурдөөлөт! Приглашаем вас на жентек той, чтобы вместе отпраздновать его появление на свет за семейным дастарханом."] },
  bachelorette: { title: ["Кыздар кечеси", "Девичник"], names: "Асел", time: "18:00", message: ["Сүйүктүү курбуларым! Силерди кыздар кечесине чакырам. Жылуу маек, жагымдуу музыка жана унутулгус сүрөттөр бизди күтөт. Ушул өзгөчө кечени бирге өткөрөлү!", "Любимые подруги! Приглашаю вас на девичник. Нас ждут тёплые разговоры, любимая музыка и фотографии на память. Проведём этот особенный вечер вместе!"] },
  corporate: { title: ["Майрамдык кече", "Праздничный вечер"], names: "Ынтымак командасы", time: "18:00", message: ["Урматтуу кесиптештер! Сиздерди майрамдык кечебизге чакырабыз. Биргелешкен ийгиликтерди белгилеп, жылуу маанайда жолугушалы. Ар бириңиздерди кубаныч менен күтөбүз!", "Дорогие коллеги! Приглашаем вас на праздничный вечер нашей команды. Отметим общие успехи и проведём время в тёплой атмосфере. Будем рады каждому из вас!"] },
  iftar: { title: ["Ифтарга чакыруу", "Приглашение на ифтар"], names: "Өмүрбек жана Үмүт", time: "19:00", message: ["Урматтуу туугандар жана достор! Сиздерди үй-бүлөбүздүн ифтар дасторконуна чакырабыз. Ооз ачуу маалын ынтымакта өткөрүп, жакшы тилектерибизди бөлүшөлү. Келериңиздерге кубанычтабыз!", "Дорогие родные и друзья! Приглашаем вас на семейный ифтар. Будем рады разделить с вами вечернюю трапезу и добрые пожелания. Ждём вас за нашим дастарханом!"] },
};

export const collectionDesigns: CollectionDesign[] = Object.entries(briefs).flatMap(([event, list]) => list.map(([slug, ky, ru, composition, motif, palette, photo]) => {
  const [paper, ink, accent, wash] = palettes[palette];
  // Kyz uzatu is presented as a portrait-led collection, like the photo-based
  // invitation references the user shared. These are local, replaceable assets.
  const kyzPortraits = [
    "/images/templates/kyz-uzatuu-photo/hero-themed.webp",
    "/images/templates/ak-jooluk/hero-themed.webp",
    "/images/template-restored/kyz-ethno-hero.webp",
    "/images/template-restored/kyz-burgundy-bride.webp",
    "/images/template-restored/kyz-gold-bride-hero.webp",
  ];
  const kyzIndex = briefs.kyz.findIndex(([key]) => key === slug);
  const weddingPhotos: Record<string, string> = {
    "olive-vow": "/images/couple-mountains.jpg",
    "silk-letter": "/images/couple-mountains.jpg",
    "night-orbit": "/images/editorial-couple.jpg",
    "our-pictures": "/images/template-restored/silk-couple.webp",
    "mountain-vow": "/images/couple-mountains.jpg",
    "rose-seal": "/images/templates/kyz-uzatuu-photo/hero-themed.webp",
    "garden-terrace": "/images/template-restored/kyz-burgundy-bride.webp",
  };
  const kyzPhotoOverrides: Record<string, string> = {
    "pearl-seal": "/images/templates/kyz-uzatuu-photo/hero-themed.webp",
    "peony-banner": "/images/template-restored/kyz-gold-bride-hero.webp",
    "mother-letter": "/images/templates/ak-jooluk/hero-themed.webp",
  };
  const direction = event === "kyz" ? kyzDirection(`collection-kyz-${slug}`) : weddingDirection(`collection-${event}-${slug}`);
  const themedPhoto = direction?.photo ? kyzAsset(direction.photo) : event === "kyz" ? kyzPhotoOverrides[slug] || kyzPortraits[kyzIndex % kyzPortraits.length] : event === "wedding" ? weddingPhotos[slug] || photo : photo;
  const id = `collection-${event}-${slug}`;
  const skin: CollectionSkin | undefined = id === "collection-kyz-pearl-seal" ? "kyz-wax" : id === "collection-kyz-peony-banner" ? "kyz-burgundy" : id === "collection-kyz-mother-letter" ? "kyz-letter" : undefined;
  return { id, event: event as CollectionEvent, name: { ky, ru }, composition, motif, paper: direction?.paper || paper, ink: direction?.ink || ink, accent: direction?.ink || accent, wash, ...(themedPhoto ? { photo: themedPhoto } : {}), ...(skin ? { skin } : {}) };
}));
const designById = new Map(collectionDesigns.map(d => [d.id, d]));
export function getCollectionDesign(inv: Pick<Invitation, "templateId" | "copy">) {
  return designById.get(inv.copy?.["collection.design"] || inv.templateId);
}

// YouTube tracks handed out to the kyz-uzatuu templates in order (cycled when there are more templates than tracks).
const kyzMusicIds = [
  "gpCaqtCGziY", "kxEG-YWbpdI", "n_a_PJ0VEsQ", "JN_u8g4S1M4", "c5wkDFu8xm8", "3kuXoL87Q0g", "77fRyNSFUc4",
  "1sParGq0sM0", "qzvoEDf1uMg", "BXGl82DmdKI", "tgIP3g2cmPE", "r4Ll2mPh0o4", "ixWPuHqq9pw",
  "7cNcwj9qTIE", "ZEKr006ECsU", "ME-29s54CE0",
];
const kyzNames = [
  "Айлин", "Айпери", "Айсулуу", "Айдана", "Арууке", "Бермет", "Сезим", "Нурпери", "Акылай", "Каныкей", "Айым", "Нурайым",
  "Айбийке", "Эркеайым", "Аруу", "Жибек", "Чолпон", "Мээрим", "Назик", "Керемет", "Айзада", "Нурзат", "Бегайым", "Алтынай",
];
const kyzName = (slug: string) => kyzNames[briefs.kyz.findIndex(([key]) => key === slug) % kyzNames.length];
// Envelope intro: the three envelope designs (classic / floral / wave) are handed out in turn, and the classic
// envelope takes its palette from the template's own colour.
const kyzEnvelopeVariants: Record<string, EnvelopeVariant> = {
  rose: "blush", clay: "ethnoCream", ivory: "ivory", wine: "burgundy", gold: "cream",
  lilac: "blush", mint: "sage", blue: "ice", ink: "midnight", cherry: "ethno",
};
const kyzEnvelope = (slug: string) => {
  const i = briefs.kyz.findIndex(([key]) => key === slug);
  return { design: envelopeDesigns[i % envelopeDesigns.length], variant: kyzEnvelopeVariants[briefs.kyz[i][5]] ?? "ethnoCream" };
};
// Wedding tracks, one per template in catalogue order; the list wraps if more templates are added.
const weddingMusicIds = [
  "4CcV6DlR6aU", "v2zagbb4bM8", "jYtN2WRTFas", "IyU7Cz8JqlI", "toUbYAnbABk", "qXYfkjVKlmc", "p0uBl4ZFEqw",
  "A2zZ3gSbMio", "7zQ3lNKuqLs", "ZnBFRUugtpg", "xPxnmKsn7JY", "183WOvQeC10", "APbahIKFKmU", "zWlEY8cZOYg", "ly7nft_y9aM",
];
const weddingNames = [
  "Айбек & Айпери", "Нурбек & Нурайым", "Бекзат & Арууке", "Азамат & Айсулуу", "Эрмек & Бермет", "Кубаныч & Сезим", "Адилет & Айдана",
  "Мирлан & Акылай", "Бакыт & Мээрим", "Эльдар & Айлин", "Руслан & Жибек", "Улан & Каныкей", "Нурсултан & Алтынай", "Эмир & Айым",
];
const weddingName = (slug: string) => weddingNames[briefs.wedding.findIndex(([key]) => key === slug) % weddingNames.length];
// Per-template names for the remaining events, in catalogue order.
const eventNames: Partial<Record<CollectionEvent, string[]>> = {
  tushoo: ["Айбар", "Нурислам", "Арууке", "Айлин", "Алихан", "Сезим", "Билал", "Нурайым", "Амир", "Айпери"],
  anniversary: ["Өмүрбек", "Гүлмира", "Бакыт", "Айгүл", "Кубаныч", "Жылдыз", "Талант", "Гүлнара"],
  beshik: ["Нурайым", "Алихан", "Айлин", "Нурислам", "Арууке", "Амир", "Айпери", "Айбар", "Сафия"],
  birthday: ["Арууке", "Айдана", "Эмир", "Сезим", "Бекзат", "Айсулуу", "Адилет", "Мээрим", "Нурсултан", "Алтынай"],
  jentek: ["Нурдөөлөт", "Айзирек", "Умар", "Амина", "Мухаммед", "Алия", "Ибрахим", "Марьям", "Юсуф"],
  bachelorette: ["Асел", "Айпери", "Арууке", "Айдана", "Сезим", "Нурайым", "Мээрим", "Айсулуу"],
  corporate: ["Ынтымак командасы", "Береке компаниясы", "Алга командасы", "Ийгилик компаниясы", "Келечек командасы", "Биримдик компаниясы"],
  iftar: ["Өмүрбек жана Үмүт", "Бакыт жана Айгүл", "Нурбек жана Гүлмира", "Кубаныч жана Жылдыз", "Азамат жана Мээрим"],
};
const eventName = (id: string, event: CollectionEvent, fallback: string) => {
  const names = eventNames[event];
  if (!names) return fallback;
  const i = briefs[event].findIndex(([key]) => `collection-${event}-${key}` === id);
  return names[i % names.length] ?? fallback;
};
// YouTube tracks for the remaining events, in catalogue order (empty string = keep the event default).
const eventMusicIds: Partial<Record<CollectionEvent, string[]>> = {
  tushoo: ["DdYyT6gtNxg", "Zv2xzmX3GgQ", "r8CWRhduI_c", "kxEG-YWbpdI", "6nPyGVST_V4", "GTg_IkXF-vE", "r8CWRhduI_c", "ADJGIKtKs8E", "qqWB0YP7Jrs", "BkkLX5bSNUo"],
  anniversary: ["S1ISGRRRis8", "3oARS5lAHc8", "JWZd_hwjwTw", "8GKky9awJrs", "RyYbI8FuM7A", "u_Nee8cVszg", "UOugLoSTf_M", "ZINL19Iuzxo"],
  beshik: ["GTg_IkXF-vE", "GTg_IkXF-vE", "Q76WaxZ8j-U", "iTVL_LG4Mzo", "GTg_IkXF-vE", "GTg_IkXF-vE", "kxEG-YWbpdI", "r8CWRhduI_c", "IFGAz1dXIxc"],
  birthday: ["nacSqWUstBw", "AbXMkqWdJbU", "vsksEa9Nl8w", "qHtrjuw0hqY", "hy4Hj85O_1E", "rOuNIp6AUoM", "Q4zmdHRSS14", "hy4Hj85O_1E", "vsksEa9Nl8w", "TxGh5tbyBIQ"],
  jentek: ["wQroPbnMW9A", "Zv2xzmX3GgQ", "IFGAz1dXIxc", "RbgFGn9CObE", "F-tQZG5QjGY", "kxEG-YWbpdI", "6nPyGVST_V4", "GTg_IkXF-vE", "dNmZTugk1Qo"],
  bachelorette: ["uqueFTt6a9M", "PJANgv4CLCU", "ptgt2ZPH3x4", "gpCaqtCGziY", "Jb1_hbjD8tQ", "YFtOFUDjJOA", "da7NevD6qdo", "9P_wHDW2VJY"],
  corporate: ["EnGPwE02YwU", "kDXbJxWyu6Q", "jLsFuEoyJtI", "A6_TmHVBFuc", "xviBEvbxgZ0", "djk4rukxPyA"],
  iftar: ["P3b76uGfJaU", "LuCEJW2MGso", "ajWdtU8yAho", "jnJdXj3P26M", "YE3KbNir3As"],
};
const eventMusicUrl = (id: string, event: CollectionEvent) => {
  const ids = eventMusicIds[event];
  if (!ids) return "";
  const i = briefs[event].findIndex(([key]) => `collection-${event}-${key}` === id);
  const videoId = ids[i];
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";
};
const weddingMusicUrl = (slug: string) => {
  const i = briefs.wedding.findIndex(([key]) => key === slug);
  return `https://www.youtube.com/watch?v=${weddingMusicIds[i % weddingMusicIds.length]}`;
};
// Wedding envelopes: the same three designs in turn, colours taken from each reference.
const weddingEnvelopeVariants: Record<string, EnvelopeVariant> = {
  "olive-vow": "sage", "peony-arch": "midnight", "silk-letter": "forest", "night-orbit": "blush", "tunduk-union": "blush",
  "lily-gate": "ivory", "our-pictures": "sage", "mountain-vow": "burgundy", "rose-seal": "blackGold", "fern-window": "cream",
  "type-love": "ivory", "swallow-post": "blush", "garden-terrace": "ice", "lotus-fold": "midnight",
};
const weddingEnvelope = (slug: string) => {
  const i = briefs.wedding.findIndex(([key]) => key === slug);
  return { design: envelopeDesigns[i % envelopeDesigns.length], variant: weddingEnvelopeVariants[slug] ?? "cream" };
};
// Other events: the three envelope designs in turn, palette matched to the design colour.
const eventEnvelopePalette: Record<string, EnvelopeVariant> = {
  mint: "sage", clay: "ethnoCream", blue: "ice", sky: "ice", gold: "cream", lilac: "blush", rose: "blush",
  ivory: "ivory", pearl: "cream", wine: "burgundy", noir: "blackGold", ink: "midnight", cherry: "burgundy",
};
const eventEnvelope = (id: string, event: CollectionEvent) => {
  const list = briefs[event];
  const i = Math.max(0, list.findIndex(([key]) => `collection-${event}-${key}` === id));
  return { design: envelopeDesigns[i % envelopeDesigns.length], variant: eventEnvelopePalette[list[i][5]] ?? "cream" };
};
const otherEvent = (event: CollectionEvent) => event !== "kyz" && event !== "wedding";
const kyzMusicUrl = (slug: string) => {
  const i = briefs.kyz.findIndex(([key]) => key === slug);
  return `https://www.youtube.com/watch?v=${kyzMusicIds[i % kyzMusicIds.length]}`;
};

/** Only these collections are published; the other events stay hidden until they are approved. */
const publishedEvents: CollectionEvent[] = ["wedding", "kyz", "tushoo", "anniversary", "beshik", "birthday", "bachelorette", "corporate", "iftar"]; // local preview: all events

export function collectionTemplate(d: CollectionDesign): InvitationTemplate {
  const example = eventExamples[d.event];
  const gallery: TemplateCanvas["gallery"] = d.photo ? { hero: d.photo } : {};
  return {
    id: d.id, name: d.name, designer: "Той Чакыруу · Studio", format: "site3d", priceSom: 990, eventTypes: [d.event],
    ...(d.event === "kyz" ? { envelope: { enabled: true, variant: kyzEnvelope(d.id.replace("collection-kyz-", "")).variant } } : d.event === "wedding" ? { envelope: { enabled: true, variant: weddingEnvelope(d.id.replace("collection-wedding-", "")).variant } } : otherEvent(d.event) ? { envelope: { enabled: true, variant: eventEnvelope(d.id, d.event).variant } } : {}),
    style: { bg: d.paper, panel: d.paper, text: d.ink, accent: d.accent, muted: d.ink, ornament: d.accent, pageBg: d.paper },
    canvas: {
      names: d.event === "kyz" ? kyzName(d.id.replace("collection-kyz-", "")) : d.event === "wedding" ? weddingName(d.id.replace("collection-wedding-", "")) : eventName(d.id, d.event, example.names), date: d.event === "corporate" ? "2026-12-26" : d.event === "iftar" ? "2027-02-20" : "2027-06-12", time: example.time,
      venue: "«Ала-Тоо» салтанат залы", address: "Чүй проспекти, 120", city: "", mapUrl: "", message: d.event === "kyz" ? example.message[0].replace("Кызыбыз Айперинин", `Кызыбыз ${kyzName(d.id.replace("collection-kyz-", ""))}`) : example.message[0],
      coverImage: "", musicUrl: d.event === "kyz" ? kyzMusicUrl(d.id.replace("collection-kyz-", "")) : d.event === "wedding" ? weddingMusicUrl(d.id.replace("collection-wedding-", "")) : eventMusicUrl(d.id, d.event), layout: {}, extras: [], blockColors: {}, gallery,
      copy: { "collection.design": d.id, ...(d.event === "kyz" ? { "envelope.design": kyzEnvelope(d.id.replace("collection-kyz-", "")).design } : {}), ...(d.event === "wedding" ? { "envelope.design": weddingEnvelope(d.id.replace("collection-wedding-", "")).design } : {}), ...(otherEvent(d.event) ? { "envelope.design": eventEnvelope(d.id, d.event).design } : {}), ...(d.event === "anniversary" ? { "collection-age": "60" } : {}) },
    },
  };
}

export const collectionTemplates = collectionDesigns.filter(d => publishedEvents.includes(d.event)).map(collectionTemplate);

/** One catalogue category; the legacy EventType remains valid for saved invitations. */
export function primaryCatalogCategory(template: InvitationTemplate): EventType {
  return template.eventTypes.find(type => type !== "toi") || "wedding";
}
