# Шаблоны по ссылкам Pinterest

Добавлены 17 вариантов: пять сайтов кыз узатуу, четыре свадебные JPG-карточки, шесть авторских свадебных сайтов и девичников, два семейных сайта. Все включены в каталог, доступны в основном редакторе и сохраняют оформление при клонировании через `canvas.copy["pinterest.design"]`.

## Авторские 3D-сайты

| Тема | Адрес |
| --- | --- |
| Жентек той — Алтын бешик | `/templates/theme-jentek-cradle` |
| Тушоо той — Первые шаги | `/templates/theme-tushoo-garden` |
| Девичник — Glam & Fabulous | `/templates/theme-bachelorette-glam` |
| Девичник — Розовые секреты | `/templates/theme-bachelorette-blush` |
| Свадьба — Оливковый шёлк | `/templates/theme-wedding-silk` |
| Никах — Прикосновение | `/templates/theme-wedding-nikah` |
| Свадьба — Вместе за руку | `/templates/theme-wedding-monochrome` |
| Свадьба — Главная новость | `/templates/theme-wedding-newspaper` |

Исходные карточки используются как визуальное направление, а не как образец готовой длинной страницы. В новых сайтах есть обложка, раскрытие приглашения, календарь, таймер, программа, карта, дресс-код и RSVP. Анимация учитывает `prefers-reduced-motion`. В редакторе все секции открыты. Анкета в предпросмотре не отправляет данные; в опубликованном приглашении используется существующий RSVP API. У девичников отдельная категория `bachelorette` с русским и кыргызским названием.

## Остальные варианты

Семейные сайты используют отдельный `FamilySiteInvite`: имя ребёнка, имена родителей, программа жентек той или тушоо той, календарь, таймер, карта и RSVP с общим числом гостей и пожеланиями для детей. Стандартные тексты доступны на русском и кыргызском. Категории `jentek` и `tushoo` добавлены в фильтры каталога. Обложка наклоняется в 3D при движении мыши; эффект отключён при редактировании и `prefers-reduced-motion`. Тексты и медальон расположены отдельными слоями. В мобильной версии раскрытие доступно кнопкой. Программа рассчитывает время относительно начала события; каждый пункт можно отредактировать.

- Кыз узатуу: `pin-kyz-ethno`, `pin-kyz-burgundy`, `pin-kyz-gold-bride`, `pin-kyz-pearl`, `pin-kyz-blue`.
- JPG: `pin-jpg-silk`, `pin-jpg-nikah`, `pin-jpg-monochrome`, `pin-jpg-newspaper`.

Имена, даты, текст, изображения и цвета доступны через `WeddingEditor` / `WeddingPart` и `ElementInspector`. Для JPG подключена та же панель элементов. Экспорт захватывает карточку вместе с добавленными элементами, без лишней высоты телефонной рамки; шрифты встраиваются в изображение.

## Источники и изображения

Соответствие исходных ссылок и загруженных файлов хранится в `public/images/pinterest-references/sources.json`. Варианты описаны в `lib/pinterestTemplates.ts`.

`gold-clean.png`, `hands-clean.png`, `mono-clean.png`, `glam-clean.png` и `blush-clean.png` восстановлены ImageGen по референсам. Впечатанные надписи удалены, чтобы редактируемый текст не накладывался на старые имена и даты. Чужой QR-код и брендинг не перенесены в карточку. Изображения представляют реконструкцию, а не оригинальные файлы авторов.

## Проверки

```powershell
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js components/PinterestInvite.tsx components/ThemedSiteInvite.tsx lib/pinterestTemplates.ts scripts/verify-pinterest-templates.mjs scripts/fetch-pinterest-references.mjs
node scripts/verify-pinterest-templates.mjs --http
node scripts/verify-reference-weddings.mjs --http
```

HTTP-проверки используют `http://localhost:3000` или `PREVIEW_URL`. Проверяются рендеринг, категории, 17 уникальных шаблонов, изображения, границы фрагментов, идентификаторы элементов, маршрутизация копий и корень экспорта JPG. Для двух семейных сайтов дополнительно проверяются отдельный рендерер, родители, детские пожелания и количество гостей. Визуальная проверка в браузере не проведена. Ранее Computer Use остановлен автопроверкой безопасности из-за невозможности определить URL; реальное скачивание JPG также не подтверждено.

## Семейные иллюстрации

Созданы встроенным ImageGen по настроению двух референсов, как новые иллюстрации без впечатанных надписей. Файлы: `public/images/pinterest-references/jentek-clean.png` и `public/images/pinterest-references/tushoo-clean.png` (1024 × 1536). Просмотрены после генерации. Полные запросы сохранены в `docs/family-image-prompts.json`.
