# Bundled fonts

These are the Google Fonts families used by `app/layout.tsx`, loaded with
`next/font/local` so development and production builds do not need network access
to Google's font CSS or Turbopack's Google font URL resolver.

Source: https://github.com/google/fonts/tree/main/ofl
Downloaded with `node scripts/fetch-local-fonts.mjs`.
Each family directory includes its original `OFL.txt` license. Font files retain
their full character sets, including Cyrillic where supported by the family.
Variable fonts cover the weight ranges declared in the layout; Philosopher uses
separate regular, bold, italic and bold italic files.

The download script is a manual maintenance utility, not a build step. Commit the
font files along with code changes when updating them.

The files in this folder are converted to `.woff2` (about 70% smaller than the `.ttf` the
script downloads). After re-running `scripts/fetch-local-fonts.mjs`, convert the new
`.ttf` files to `.woff2` and update the paths in `app/layout.tsx`.

## ptsans-ky (резерв для кыргызских букв)

Подмножество PT Sans (Regular, Bold) из 6 глифов: ң Ң ө Ө ү Ү, ~3 КБ каждое. Нужно, потому что
в Manrope нет «ң/Ң», а в Great Vibes и Unbounded нет ни «ң», ни «ө», ни «ү» (проверено fontkit,
см. docs/fonts-audit.md). Подключено в `app/globals.css` как `KyFallback` с `unicode-range`
и добавлено в `fallback` этих шрифтов в `app/layout.tsx`. Лицензия: SIL OFL 1.1 (ParaType), см. `OFL.txt`.
Источник: https://github.com/google/fonts/tree/main/ofl/ptsans

## montserrat, notoserif, notosans

Вариативные шрифты (ось веса), обрезаны через harfbuzz (`subset-font`) до латиницы, кириллицы (U+0400–04FF),
пунктуации и символов №€₸₽←→♡★☆•, формат woff2. Подключены в `app/layout.tsx` с `preload: false`:
браузер загружает файл только если шрифт используется на странице. Глифы ң/ө/ү проверены, см. `docs/fonts-audit.md`.
