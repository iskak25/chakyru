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
