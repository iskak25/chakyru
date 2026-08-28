import Link from "next/link";

export function Logo({
  href = "/",
  className = "h-12 w-auto",
  onClick,
}: {
  href?: string | null;
  className?: string;
  onClick?: () => void;
}) {
  const img = (
    <img
      src="/logo.png"
      alt="Chakyru.kg"
      className={`object-contain mix-blend-lighten ${className}`}
    />
  );
  if (!href) return img;
  return (
    <Link href={href} onClick={onClick} className="inline-flex items-center justify-center">
      {img}
    </Link>
  );
}
