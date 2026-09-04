import Link from "next/link";

export function Logo({
  href = "/",
  className = "",
  onClick,
  tone = "ink",
}: {
  href?: string | null;
  className?: string;
  onClick?: () => void;
  tone?: "ink" | "cream";
}) {
  const color = tone === "cream" ? "text-gold-bright" : "text-ink";
  const mark = (
    <span className={`inline-flex flex-col items-center leading-none ${color} ${className}`}>
      <span className="font-serif text-[17px] font-normal tracking-[0.32em] uppercase sm:text-[19px]">
        Chakyru
      </span>
      <span className="mt-1.5 text-[8px] uppercase tracking-[0.42em] opacity-70">kg</span>
    </span>
  );
  if (!href) return mark;
  return (
    <Link href={href} onClick={onClick} className="inline-flex items-center justify-center">
      {mark}
    </Link>
  );
}
