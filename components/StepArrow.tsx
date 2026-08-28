"use client";

export function StepArrow({
  dir,
  onClick,
  disabled,
  label,
  size = "md",
}: {
  dir: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex items-center justify-center text-cream transition hover:text-gold disabled:pointer-events-none disabled:opacity-25 ${
        size === "sm" ? "h-10 w-12" : "h-14 w-16"
      }`}
    >
      <svg
        viewBox="0 0 56 28"
        className={`${size === "sm" ? "h-5 w-10" : "h-7 w-14"} ${dir === "right" ? "-scale-x-100" : ""}`}
        aria-hidden
      >
        <path fill="currentColor" d="M18.2 1.6 1.2 14l17 12.4v-7.6H54.8V9.2H18.2V1.6Z" />
      </svg>
    </button>
  );
}
