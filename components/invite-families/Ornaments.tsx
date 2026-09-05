export function GoldFiligree({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 16" className={className} fill="none" aria-hidden>
      <path d="M8 8H88" stroke="currentColor" strokeWidth="0.8" />
      <path d="M132 8H212" stroke="currentColor" strokeWidth="0.8" />
      <path d="M110 2.5L114.5 8L110 13.5L105.5 8Z" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="110" cy="8" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function HeartRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-12 bg-current opacity-25" />
      <svg viewBox="0 0 16 14" className="h-3 w-3 opacity-70" aria-hidden>
        <path
          fill="currentColor"
          d="M8 13s-6.2-3.8-6.2-7.2C1.8 3.6 3.4 2.2 5.2 2.2c1.1 0 1.8.6 2.8 1.7 1-1.1 1.7-1.7 2.8-1.7 1.8 0 3.4 1.4 3.4 3.6C14.2 9.2 8 13 8 13Z"
        />
      </svg>
      <span className="h-px w-12 bg-current opacity-25" />
    </div>
  );
}

export function WaveEdge({ fill, flip }: { fill: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 400 42"
      className={`block w-full ${flip ? "rotate-180" : ""}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path fill={fill} d="M0 42V16C62 40 118-6 200 16c70 19 128-8 200 8v18H0Z" />
    </svg>
  );
}

export function TraHorn({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 28" className={className} fill="none" aria-hidden>
      <path
        d="M8 20c4-10 12-14 24-14s20 4 24 14"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path d="M20 20c2-6 6-8 12-8s10 2 12 8" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="32" cy="20" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function TraBand() {
  return (
    <div className="fam-tra-band" aria-hidden />
  );
}
