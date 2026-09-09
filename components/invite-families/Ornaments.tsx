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

export function KyalDiamond({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <path d="M16 2 26 16 16 30 6 16Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M16 9 21 16 16 23 11 16Z" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function KyalRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-10 bg-current opacity-30" />
      <KyalDiamond className="h-4 w-4" />
      <span className="h-px w-10 bg-current opacity-30" />
    </div>
  );
}

export function CalendarGrid({
  date,
  monthLabel,
  className = "",
  cellClassName = "text-[#1a1a1a]",
  headClassName = "text-[#7a7a7a]",
  highlightClassName = "bg-[#1a1a1a] text-white",
}: {
  date: Date;
  monthLabel: string;
  className?: string;
  cellClassName?: string;
  headClassName?: string;
  highlightClassName?: string;
}) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventDay = date.getDate();
  const lead = (firstDay + 6) % 7;

  const days: (number | null)[] = [];
  for (let i = 0; i < lead; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className={`mx-auto max-w-[280px] text-center ${className}`}>
      <p className={`text-[11px] uppercase tracking-[0.12em] ${headClassName}`}>
        {monthLabel} {year}
      </p>
      <div className="mt-3 grid grid-cols-7 gap-1 text-[12px]">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
          <div key={day} className={`p-1 text-[10px] font-medium ${headClassName}`}>
            {day}
          </div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className={`flex h-7 items-center justify-center rounded-full text-[11px] ${
              day === eventDay ? `font-medium ${highlightClassName}` : cellClassName
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DoveOrnament({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" className={className} fill="none" aria-hidden>
      <path
        d="M50 40c-6-10-18-16-32-14 6 4 10 9 11 15-8 0-14 3-19 9 9 3 18 2 25-3 4 6 12 9 20 8-3-5-3-10 0-15 8 4 18 3 25-3-9-2-17-7-21-14 6-1 11-4 14-9-9-1-18 3-23 10Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <circle cx="49" cy="27" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function LaurelMonogram({ initials, className = "" }: { initials: string; className?: string }) {
  return (
    <svg viewBox="0 0 140 100" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.1" opacity="0.85">
        <path d="M40 78C22 68 16 46 24 26" />
        <path d="M100 78c18-10 24-32 16-52" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`l${i}`} d={`M${26 + i * 3.4} ${70 - i * 10}c-6-2-10-6-11-12`} />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`r${i}`} d={`M${114 - i * 3.4} ${70 - i * 10}c6-2 10-6 11-12`} />
        ))}
      </g>
      <text
        x="70"
        y="66"
        textAnchor="middle"
        fill="currentColor"
        fontSize="30"
        fontFamily="serif"
        letterSpacing="2"
      >
        {initials}
      </text>
    </svg>
  );
}

export function MountainSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 60" className={className} fill="none" aria-hidden preserveAspectRatio="none">
      <path
        d="M0 60 32 22 54 42 88 10 118 40 150 18 178 44 206 24 240 50V60Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M32 22 40 30M118 40 128 34M178 44 188 36" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
