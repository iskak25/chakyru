export function Ornament({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M4 12h62M196 12h-62"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.7"
      />
      <path
        d="M100 3.5c2.4 4.2 6.8 6.8 11.5 6.8-4.7 0-9.1 2.6-11.5 6.8-2.4-4.2-6.8-6.8-11.5-6.8 4.7 0 9.1-2.6 11.5-6.8Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <circle cx="100" cy="12" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function CornerFrame({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-3 ${className}`}>
      <span className="absolute left-0 top-0 h-8 w-8 border-l border-t" />
      <span className="absolute right-0 top-0 h-8 w-8 border-r border-t" />
      <span className="absolute bottom-0 left-0 h-8 w-8 border-b border-l" />
      <span className="absolute bottom-0 right-0 h-8 w-8 border-b border-r" />
    </div>
  );
}
