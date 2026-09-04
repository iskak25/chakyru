import Link from "next/link";
import type { ReactNode } from "react";

export function TextLink({
  href,
  children,
  className = "",
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className={`link-edit ${className}`}>
      {children}
    </Link>
  );
}
