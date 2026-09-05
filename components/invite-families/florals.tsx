export function IvoryCornerBloom({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 140" className={className} aria-hidden>
      <ellipse cx="118" cy="108" rx="28" ry="18" fill="#e8c9c0" opacity="0.55" />
      <ellipse cx="96" cy="96" rx="22" ry="16" fill="#d9b3a8" opacity="0.7" />
      <ellipse cx="112" cy="88" rx="16" ry="14" fill="#f3ddd6" opacity="0.85" />
      <ellipse cx="70" cy="118" rx="20" ry="12" fill="#c9b7a4" opacity="0.45" />
      <path d="M38 92c18-8 28 4 34 18" stroke="#8f9a7e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M28 108c12-22 8-36-6-48" stroke="#7f8b6e" strokeWidth="2.4" fill="none" />
      <ellipse cx="24" cy="56" rx="14" ry="22" fill="#9aa884" opacity="0.55" transform="rotate(-28 24 56)" />
      <ellipse cx="48" cy="44" rx="10" ry="18" fill="#b7c09a" opacity="0.5" transform="rotate(18 48 44)" />
    </svg>
  );
}

export function MauveCornerBloom({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 160" className={className} aria-hidden>
      <ellipse cx="128" cy="36" rx="34" ry="22" fill="#c9a39a" opacity="0.45" />
      <ellipse cx="108" cy="28" rx="22" ry="16" fill="#b88880" opacity="0.55" />
      <ellipse cx="140" cy="22" rx="18" ry="14" fill="#e4cfc8" opacity="0.8" />
      <ellipse cx="150" cy="54" rx="16" ry="12" fill="#d2b09f" opacity="0.55" />
      <path d="M86 78c22-18 40-10 52 8" stroke="#8b9474" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="78" cy="70" rx="12" ry="20" fill="#9aa57c" opacity="0.5" transform="rotate(-40 78 70)" />
      <ellipse cx="62" cy="88" rx="10" ry="18" fill="#b8c094" opacity="0.45" transform="rotate(20 62 88)" />
      <ellipse cx="96" cy="48" rx="20" ry="14" fill="#d8b8ae" opacity="0.65" />
    </svg>
  );
}

export function GoldFlourish({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 18" className={className} fill="none" aria-hidden>
      <path d="M8 9c24-10 48 10 72 0s48-10 72 0" stroke="#c2a36a" strokeWidth="1.1" />
      <circle cx="80" cy="9" r="2" fill="#c2a36a" />
      <path d="M72 9h16M80 3v12" stroke="#c2a36a" strokeWidth="0.8" />
    </svg>
  );
}

export function IconGlasses({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <path d="M7 10h6l-1 14H8L7 10Z" />
      <path d="M19 10h6l-1 14h-4L19 10Z" />
      <path d="M13 12h6" />
    </svg>
  );
}

export function IconArch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <path d="M7 26V14a9 9 0 0 1 18 0v12" />
      <path d="M11 26V16a5 5 0 0 1 10 0v10" />
    </svg>
  );
}

export function IconPlate({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <circle cx="15" cy="16" r="8" />
      <circle cx="15" cy="16" r="3.5" />
      <path d="M25 9v14M27 11v10" />
    </svg>
  );
}

export function IconCake({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <path d="M8 26h16v-5H8v5Z" />
      <path d="M11 21h10v-5H11v5Z" />
      <path d="M13 16h6V12h-6v4Z" />
      <path d="M16 12v-3" />
    </svg>
  );
}

export function IconNote({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M9 18a3 3 0 1 1-2-2.83V7.5l10-2v9.67A3 3 0 1 1 15 17V8.2L9 9.4V18Z" />
    </svg>
  );
}

export function IconSpark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2l1.2 6.3L20 8l-5.2 3.2L16.8 18 12 14.6 7.2 18l2-6.8L4 8l6.8-.7L12 2Z" />
    </svg>
  );
}

export const IVORY_ICONS = [IconGlasses, IconArch, IconPlate, IconCake];
export const MAUVE_ICONS = [IconPlate, IconNote, IconSpark, IconGlasses];
