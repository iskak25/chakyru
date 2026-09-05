type IconProps = { className?: string };

export function HeartOutline({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 14" className={className} fill="none" aria-hidden>
      <path
        d="M8 13s-6.2-3.8-6.2-7.2C1.8 3.6 3.4 2.2 5.2 2.2c1.1 0 1.8.6 2.8 1.7 1-1.1 1.7-1.7 2.8-1.7 1.8 0 3.4 1.4 3.4 3.6C14.2 9.2 8 13 8 13Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    </svg>
  );
}

export function IconPin({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconCutlery({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M7 4v7M5 4v4c0 2 2 3 2 3v9M9 4v4c0 2-2 3-2 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 4v16M16 4c2.4 0 3 2.2 3 4s-.6 4-3 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconMusic({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M9 18V6l10-2v12" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="16" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconSparkle({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M12 3v18M4.5 7.5 12 12l7.5-4.5M4.5 16.5 12 12l7.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconGlasses({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M7 9c2 0 3.5 1 4 3M17 9c-2 0-3.5 1-4 3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 10c.4 4 1.6 8 3 9h0c1.2-1 2-3.2 2.4-6M19 10c-.4 4-1.6 8-3 9h0c-1.2-1-2-3.2-2.4-6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function IconRings({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="9" cy="13" r="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="15" cy="13" r="5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function IconPlate({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function IconCake({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path d="M8 11h8v3H8zM6 14h12v5H6zM12 6v3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 20c.6-1 1.4-1 2-1s1.4 0 2 1M8 14c.6-1 1.4-1 2-1s1.4 0 2 1 1.4 1 2 1 1.4 0 2-1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function FloralCorner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 160" className={className} aria-hidden>
      <g fill="none" stroke="#b79a8e" strokeWidth="1">
        <path d="M150 18c-18 8-28 24-22 40 10 4 24-2 32-16" opacity="0.7" />
        <path d="M118 28c-8 14-4 30 10 36" opacity="0.55" />
      </g>
      <ellipse cx="142" cy="36" rx="16" ry="22" fill="#f3e4dc" transform="rotate(-18 142 36)" />
      <ellipse cx="128" cy="48" rx="13" ry="18" fill="#ead3cc" transform="rotate(16 128 48)" />
      <ellipse cx="156" cy="52" rx="11" ry="15" fill="#f7eee8" transform="rotate(-8 156 52)" />
      <ellipse cx="118" cy="62" rx="10" ry="14" fill="#d9c2b4" transform="rotate(28 118 62)" />
      <path d="M108 70c-18 18-22 40-10 58" stroke="#9a7d72" strokeWidth="1.2" fill="none" opacity="0.65" />
      <path d="M132 78c8 16 6 34-8 46" stroke="#8f7468" strokeWidth="1.1" fill="none" opacity="0.5" />
      <ellipse cx="104" cy="96" rx="9" ry="16" fill="#c9b3a4" transform="rotate(-40 104 96)" />
      <circle cx="148" cy="44" r="3" fill="#c9a8a0" />
    </svg>
  );
}

export function Flourish({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" className={className} fill="none" aria-hidden>
      <path d="M4 6h44M72 6h44" stroke="currentColor" strokeWidth="0.8" />
      <path d="M60 2.2c2 2.2 2 5.4 0 7.6-2-2.2-2-5.4 0-7.6Z" fill="currentColor" />
    </svg>
  );
}

export function FloralFooter({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 90" className={className} aria-hidden>
      <ellipse cx="98" cy="58" rx="22" ry="16" fill="#f0d8d2" transform="rotate(-18 98 58)" />
      <ellipse cx="118" cy="70" rx="16" ry="12" fill="#e7c8c0" transform="rotate(22 118 70)" />
      <ellipse cx="86" cy="74" rx="14" ry="10" fill="#f6e6e1" />
      <path d="M70 78c12-10 28-8 40 4" stroke="#c9a69a" strokeWidth="1" fill="none" />
    </svg>
  );
}
