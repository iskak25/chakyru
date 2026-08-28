"use client";

/** Decorative SVG stickers. Fill via currentColor so the editor palette works. */
export const STICKERS: { id: string; group: "wreath" | "heart" | "frame" | "flora" | "ornament" }[] = [
  { id: "wreath-lush", group: "wreath" },
  { id: "wreath-eucalyptus", group: "wreath" },
  { id: "wreath-leaf", group: "wreath" },
  { id: "wreath-round", group: "wreath" },
  { id: "wreath-flower", group: "wreath" },
  { id: "wreath-dots", group: "wreath" },
  { id: "wreath-hex", group: "wreath" },
  { id: "wreath-oval", group: "wreath" },
  { id: "heart", group: "heart" },
  { id: "hearts-3", group: "heart" },
  { id: "heart-outline", group: "heart" },
  { id: "heart-double", group: "heart" },
  { id: "frame-bloom", group: "frame" },
  { id: "frame-laurel-open", group: "frame" },
  { id: "frame-heart-open", group: "frame" },
  { id: "frame-arch-leaf", group: "frame" },
  { id: "frame-corners-leaf", group: "frame" },
  { id: "frame-circle", group: "frame" },
  { id: "frame-ornate", group: "frame" },
  { id: "frame-hex", group: "frame" },
  { id: "frame-square", group: "frame" },
  { id: "frame-scallop", group: "frame" },
  { id: "frame-diamond", group: "frame" },
  { id: "leaf", group: "flora" },
  { id: "branch", group: "flora" },
  { id: "flower", group: "flora" },
  { id: "rose", group: "flora" },
  { id: "tulip", group: "flora" },
  { id: "vine", group: "flora" },
  { id: "fern", group: "flora" },
  { id: "blossom", group: "flora" },
  { id: "star", group: "ornament" },
  { id: "sparkle", group: "ornament" },
  { id: "rings", group: "ornament" },
  { id: "bow", group: "ornament" },
  { id: "moon", group: "ornament" },
  { id: "sun", group: "ornament" },
  { id: "corner", group: "ornament" },
  { id: "swirl", group: "ornament" },
  { id: "diamond", group: "ornament" },
  { id: "crescent", group: "ornament" },
  { id: "bird", group: "ornament" },
  { id: "lantern", group: "ornament" },
  { id: "clover", group: "flora" },
  { id: "daisy", group: "flora" },
  { id: "sprig", group: "flora" },
  { id: "bud", group: "flora" },
  { id: "berry", group: "flora" },
  { id: "lotus", group: "flora" },
  { id: "arch", group: "ornament" },
  { id: "ribbon", group: "ornament" },
  { id: "wave", group: "ornament" },
  { id: "burst", group: "ornament" },
  { id: "dots-line", group: "ornament" },
  { id: "seal", group: "ornament" },
  { id: "crown", group: "ornament" },
  { id: "flourish", group: "ornament" },
  { id: "knot", group: "ornament" },
  { id: "frame-dots", group: "frame" },
];

export const STICKER_GROUPS: {
  id: (typeof STICKERS)[number]["group"];
  ky: string;
  ru: string;
}[] = [
  { id: "wreath", ky: "Веноктор", ru: "Венки" },
  { id: "heart", ky: "Жүрөктөр", ru: "Сердца" },
  { id: "frame", ky: "Рамкалар", ru: "Рамки" },
  { id: "flora", ky: "Гүлдөр", ru: "Цветы" },
  { id: "ornament", ky: "Оюулар", ru: "Орнамент" },
];

export function StickerGlyph({ id, color = "#1a1a1a" }: { id: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      fill="currentColor"
      style={{ color }}
      aria-hidden
    >
      {glyph(id)}
    </svg>
  );
}

function glyph(id: string) {
  switch (id) {
    case "wreath-lush":
      return (
        <>
          {Array.from({ length: 22 }, (_, i) => {
            const a = (i / 22) * Math.PI * 2;
            const r = i % 2 ? 34 : 38;
            const x = 50 + Math.cos(a) * r;
            const y = 50 + Math.sin(a) * r;
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx={i % 3 ? 5 : 7}
                ry={i % 2 ? 13 : 16}
                transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`}
                opacity={0.88}
              />
            );
          })}
        </>
      );
    case "wreath-eucalyptus":
      return (
        <>
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const x = 50 + Math.cos(a) * 36;
            const y = 50 + Math.sin(a) * 36;
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx="4"
                ry="12"
                transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`}
              />
            );
          })}
        </>
      );
    case "frame-bloom":
      return (
        <>
          <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <ellipse cx="22" cy="22" rx="7" ry="12" transform="rotate(-40 22 22)" />
          <ellipse cx="30" cy="16" rx="6" ry="11" transform="rotate(-10 30 16)" />
          <ellipse cx="16" cy="30" rx="6" ry="10" transform="rotate(-70 16 30)" />
          <circle cx="24" cy="24" r="4" />
          <ellipse cx="38" cy="14" rx="5" ry="9" transform="rotate(20 38 14)" />
        </>
      );
    case "frame-laurel-open":
      return (
        <>
          <path d="M50 88 C32 78 18 62 16 44" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M50 88 C68 78 82 62 84 44" fill="none" stroke="currentColor" strokeWidth="2" />
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i}>
              <ellipse cx={24 + i * 2} cy={78 - i * 8} rx="5" ry="10" transform={`rotate(-55 ${24 + i * 2} ${78 - i * 8})`} />
              <ellipse cx={76 - i * 2} cy={78 - i * 8} rx="5" ry="10" transform={`rotate(55 ${76 - i * 2} ${78 - i * 8})`} />
            </g>
          ))}
        </>
      );
    case "frame-heart-open":
      return (
        <path
          d="M50 88 C50 88 12 62 12 38 C12 22 24 12 36 12 C44 12 48 18 50 24 C52 18 56 12 64 12 C76 12 88 22 88 38 C88 62 50 88 50 88 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      );
    case "frame-arch-leaf":
      return (
        <>
          <path
            d="M14 86 V48 A36 36 0 0 1 86 48 V86"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          {Array.from({ length: 9 }, (_, i) => {
            const t = (i / 8) * Math.PI;
            const x = 50 + Math.cos(Math.PI - t) * 36;
            const y = 48 - Math.sin(t) * 36;
            return <ellipse key={i} cx={x} cy={y} rx="4" ry="9" transform={`rotate(${90 - (t * 180) / Math.PI} ${x} ${y})`} />;
          })}
        </>
      );
    case "frame-corners-leaf":
      return (
        <>
          <path d="M12 32 V12 H32" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M68 12 H88 V32" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M88 68 V88 H68" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M32 88 H12 V68" fill="none" stroke="currentColor" strokeWidth="3" />
          <ellipse cx="22" cy="22" rx="6" ry="11" transform="rotate(-45 22 22)" />
          <ellipse cx="78" cy="22" rx="6" ry="11" transform="rotate(45 78 22)" />
          <ellipse cx="78" cy="78" rx="6" ry="11" transform="rotate(-45 78 78)" />
          <ellipse cx="22" cy="78" rx="6" ry="11" transform="rotate(45 22 78)" />
        </>
      );
    case "wreath-leaf":
      return (
        <>
          <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="2" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const x = 50 + Math.cos(a) * 34;
            const y = 50 + Math.sin(a) * 34;
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx="5"
                ry="10"
                transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`}
              />
            );
          })}
        </>
      );
    case "wreath-round":
      return (
        <>
          <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="50" cy="14" r="5" />
          <circle cx="50" cy="86" r="5" />
          <circle cx="14" cy="50" r="5" />
          <circle cx="86" cy="50" r="5" />
        </>
      );
    case "wreath-flower":
      return (
        <>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <ellipse
                key={i}
                cx={50 + Math.cos(a) * 28}
                cy={50 + Math.sin(a) * 28}
                rx="8"
                ry="14"
                transform={`rotate(${(a * 180) / Math.PI + 90} ${50 + Math.cos(a) * 28} ${50 + Math.sin(a) * 28})`}
                opacity="0.9"
              />
            );
          })}
          <circle cx="50" cy="50" r="10" />
        </>
      );
    case "wreath-dots":
      return (
        <>
          <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return <circle key={i} cx={50 + Math.cos(a) * 38} cy={50 + Math.sin(a) * 38} r={i % 2 ? 2 : 3.5} />;
          })}
        </>
      );
    case "wreath-hex":
      return (
        <polygon
          points="50,8 86,29 86,71 50,92 14,71 14,29"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      );
    case "wreath-oval":
      return (
        <ellipse cx="50" cy="50" rx="28" ry="40" fill="none" stroke="currentColor" strokeWidth="3" />
      );
    case "heart":
      return (
        <path d="M50 88 C50 88 12 62 12 38 C12 22 24 12 36 12 C44 12 48 18 50 24 C52 18 56 12 64 12 C76 12 88 22 88 38 C88 62 50 88 50 88 Z" />
      );
    case "hearts-3":
      return (
        <>
          <path d="M32 70 C32 70 10 54 10 38 C10 28 18 22 26 22 C31 22 34 26 35 30 C36 26 39 22 44 22 C52 22 60 28 60 38 C60 54 32 70 32 70 Z" />
          <path d="M68 55 C68 55 50 42 50 30 C50 22 56 18 62 18 C66 18 68 21 69 24 C70 21 72 18 76 18 C82 18 88 22 88 30 C88 42 68 55 68 55 Z" />
          <path d="M55 92 C55 92 32 76 32 58 C32 46 42 38 52 38 C58 38 62 42 64 48 C66 42 70 38 76 38 C86 38 96 46 96 58 C96 76 55 92 55 92 Z" opacity="0.85" />
        </>
      );
    case "heart-outline":
      return (
        <path
          d="M50 88 C50 88 12 62 12 38 C12 22 24 12 36 12 C44 12 48 18 50 24 C52 18 56 12 64 12 C76 12 88 22 88 38 C88 62 50 88 50 88 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      );
    case "heart-double":
      return (
        <>
          <path
            d="M42 78 C42 78 14 58 14 38 C14 24 24 16 34 16 C40 16 44 20 46 26 C48 20 52 16 58 16 C68 16 78 24 78 38 C78 50 68 62 58 70"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path d="M62 88 C62 88 36 70 36 50 C36 38 44 30 54 30 C59 30 62 34 63 38 C64 34 67 30 72 30 C82 30 90 38 90 50 C90 70 62 88 62 88 Z" />
        </>
      );
    case "frame-circle":
      return (
        <>
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="1" />
        </>
      );
    case "frame-ornate":
      return (
        <>
          <rect x="14" y="14" width="72" height="72" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M14 26 Q50 8 86 26" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 74 Q50 92 86 74" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </>
      );
    case "frame-hex":
      return (
        <>
          <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <polygon points="50,16 80,33 80,67 50,84 20,67 20,33" fill="none" stroke="currentColor" strokeWidth="1" />
        </>
      );
    case "frame-square":
      return (
        <rect x="12" y="12" width="76" height="76" fill="none" stroke="currentColor" strokeWidth="4" />
      );
    case "frame-scallop":
      return (
        <path
          d="M20 20 Q30 8 40 20 Q50 8 60 20 Q70 8 80 20 Q92 30 80 40 Q92 50 80 60 Q92 70 80 80 Q70 92 60 80 Q50 92 40 80 Q30 92 20 80 Q8 70 20 60 Q8 50 20 40 Q8 30 20 20 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      );
    case "frame-diamond":
      return (
        <polygon points="50,6 94,50 50,94 6,50" fill="none" stroke="currentColor" strokeWidth="3" />
      );
    case "leaf":
      return <path d="M50 8c20 22 30 44 30 64 0 16-12 24-30 24S20 88 20 72C20 52 30 30 50 8Z" />;
    case "branch":
      return (
        <>
          <path d="M18 82 C40 60 48 40 52 12" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <ellipse cx="40" cy="48" rx="8" ry="16" transform="rotate(-40 40 48)" />
          <ellipse cx="58" cy="32" rx="7" ry="14" transform="rotate(-20 58 32)" />
          <ellipse cx="62" cy="52" rx="6" ry="12" transform="rotate(30 62 52)" />
        </>
      );
    case "flower":
      return (
        <>
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse
              key={i}
              cx="50"
              cy="28"
              rx="8"
              ry="18"
              transform={`rotate(${i * 60} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="8" />
        </>
      );
    case "rose":
      return (
        <>
          <path d="M50 88 C50 70 22 62 22 42 C22 28 34 20 50 28 C66 20 78 28 78 42 C78 62 50 70 50 88 Z" />
          <circle cx="50" cy="40" r="8" opacity="0.35" />
        </>
      );
    case "tulip":
      return (
        <>
          <path d="M50 92 V48" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M50 22 C38 22 28 38 32 52 C40 48 50 58 50 58 C50 58 60 48 68 52 C72 38 62 22 50 22 Z" />
        </>
      );
    case "vine":
      return (
        <path
          d="M12 70 C28 40 40 80 55 45 C68 20 78 60 88 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    case "fern":
      return (
        <>
          <path d="M50 90 V12" fill="none" stroke="currentColor" strokeWidth="2" />
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse
              key={i}
              cx={i % 2 ? 38 : 62}
              cy={22 + i * 10}
              rx="10"
              ry="5"
            />
          ))}
        </>
      );
    case "blossom":
      return (
        <>
          <circle cx="50" cy="32" r="14" />
          <circle cx="32" cy="58" r="14" />
          <circle cx="68" cy="58" r="14" />
          <circle cx="50" cy="52" r="8" />
        </>
      );
    case "star":
      return (
        <polygon points="50,6 61,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 39,38" />
      );
    case "sparkle":
      return (
        <>
          <polygon points="50,8 54,46 92,50 54,54 50,92 46,54 8,50 46,46" />
          <polygon points="78,18 80,30 92,32 80,34 78,46 76,34 64,32 76,30" />
        </>
      );
    case "rings":
      return (
        <>
          <circle cx="38" cy="52" r="22" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="62" cy="52" r="22" fill="none" stroke="currentColor" strokeWidth="4" />
        </>
      );
    case "bow":
      return (
        <>
          <polygon points="50,50 12,28 18,58" />
          <polygon points="50,50 88,28 82,58" />
          <rect x="42" y="42" width="16" height="16" rx="2" />
          <path d="M46 58 Q40 82 32 88" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M54 58 Q60 82 68 88" fill="none" stroke="currentColor" strokeWidth="3" />
        </>
      );
    case "moon":
      return <path d="M62 16 A36 36 0 1 0 62 84 A28 28 0 1 1 62 16 Z" />;
    case "sun":
      return (
        <>
          <circle cx="50" cy="50" r="16" />
          {Array.from({ length: 8 }, (_, i) => (
            <rect
              key={i}
              x="48"
              y="8"
              width="4"
              height="16"
              transform={`rotate(${i * 45} 50 50)`}
            />
          ))}
        </>
      );
    case "corner":
      return (
        <path
          d="M12 88 V20 Q20 12 88 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      );
    case "swirl":
      return (
        <path
          d="M70 28 C80 40 78 62 58 72 C34 84 18 64 28 48 C38 32 58 40 54 52"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      );
    case "diamond":
      return <polygon points="50,8 88,50 50,92 12,50" />;
    case "crescent":
      return <path d="M68 18 A38 38 0 1 0 68 82 A26 26 0 1 1 68 18 Z" />;
    case "bird":
      return (
        <path d="M18 58 C32 40 48 36 62 42 C70 28 86 24 92 22 C84 36 78 48 72 54 C78 58 86 70 88 78 C70 70 58 62 50 58 C38 70 24 74 12 72 C20 66 22 62 18 58 Z" />
      );
    case "lantern":
      return (
        <>
          <rect x="38" y="28" width="24" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M38 36 H62 M38 60 H62" stroke="currentColor" strokeWidth="2" />
          <path d="M50 16 V28 M42 16 H58" stroke="currentColor" strokeWidth="3" />
          <path d="M32 68 H68 L62 80 H38 Z" />
        </>
      );
    case "clover":
      return (
        <>
          <ellipse cx="50" cy="38" rx="12" ry="16" />
          <ellipse cx="36" cy="52" rx="16" ry="12" />
          <ellipse cx="64" cy="52" rx="16" ry="12" />
          <path d="M50 58 V90" fill="none" stroke="currentColor" strokeWidth="3" />
        </>
      );
    case "daisy":
      return (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx="50" cy="26" rx="6" ry="16" transform={`rotate(${i * 45} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="10" />
        </>
      );
    case "sprig":
      return (
        <>
          <path d="M22 78 C40 58 50 40 62 16" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <ellipse cx="36" cy="62" rx="7" ry="14" transform="rotate(-50 36 62)" />
          <ellipse cx="50" cy="44" rx="6" ry="12" transform="rotate(-30 50 44)" />
          <ellipse cx="58" cy="30" rx="5" ry="10" transform="rotate(-15 58 30)" />
        </>
      );
    case "bud":
      return (
        <>
          <path d="M50 92 V48" fill="none" stroke="currentColor" strokeWidth="3" />
          <ellipse cx="50" cy="36" rx="14" ry="20" />
          <ellipse cx="50" cy="32" rx="7" ry="12" opacity="0.35" />
        </>
      );
    case "berry":
      return (
        <>
          <circle cx="38" cy="42" r="12" />
          <circle cx="58" cy="38" r="11" />
          <circle cx="50" cy="58" r="12" />
          <path d="M48 28 C54 18 66 16 70 22" fill="none" stroke="currentColor" strokeWidth="2" />
        </>
      );
    case "lotus":
      return (
        <>
          <ellipse cx="50" cy="62" rx="10" ry="22" />
          <ellipse cx="34" cy="60" rx="10" ry="20" transform="rotate(-28 34 60)" />
          <ellipse cx="66" cy="60" rx="10" ry="20" transform="rotate(28 66 60)" />
          <ellipse cx="22" cy="66" rx="8" ry="16" transform="rotate(-48 22 66)" />
          <ellipse cx="78" cy="66" rx="8" ry="16" transform="rotate(48 78 66)" />
        </>
      );
    case "arch":
      return (
        <path
          d="M16 82 V48 A34 34 0 0 1 84 48 V82"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      );
    case "ribbon":
      return (
        <>
          <path d="M18 38 H82 L70 62 H30 Z" />
          <rect x="40" y="28" width="20" height="44" rx="2" />
        </>
      );
    case "wave":
      return (
        <path
          d="M8 58 C22 28 36 28 50 58 C64 88 78 88 92 58"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      );
    case "burst":
      return (
        <polygon points="50,6 56,40 92,28 64,50 96,70 60,62 70,96 50,70 30,96 40,62 4,70 36,50 8,28 44,40" />
      );
    case "dots-line":
      return (
        <>
          <circle cx="16" cy="50" r="5" />
          <circle cx="34" cy="50" r="4" />
          <circle cx="50" cy="50" r="6" />
          <circle cx="66" cy="50" r="4" />
          <circle cx="84" cy="50" r="5" />
        </>
      );
    case "seal":
      return (
        <>
          <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="50" cy="50" r="18" />
        </>
      );
    case "crown":
      return <polygon points="12,72 12,38 32,56 50,20 68,56 88,38 88,72" />;
    case "flourish":
      return (
        <path
          d="M12 62 C28 28 48 28 50 50 C52 72 72 72 88 38"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    case "knot":
      return (
        <>
          <circle cx="38" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="62" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="50" cy="38" r="16" fill="none" stroke="currentColor" strokeWidth="4" />
        </>
      );
    case "frame-dots":
      return (
        <>
          <rect x="16" y="16" width="68" height="68" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="16" cy="16" r="4" />
          <circle cx="84" cy="16" r="4" />
          <circle cx="16" cy="84" r="4" />
          <circle cx="84" cy="84" r="4" />
        </>
      );
    default:
      return <circle cx="50" cy="50" r="28" />;
  }
}
