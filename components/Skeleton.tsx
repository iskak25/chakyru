import type { CSSProperties } from "react";

/** Base shimmering block. Size/shape come from className (or style). */
export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden="true" className={`skeleton rounded-[10px] ${className}`} style={style} />;
}

function Status({ label }: { label?: string }) {
  return <span role="status" className="sr-only">{label || "Loading…"}</span>;
}

/** Card like the dashboard / my-ads cards: photo + title + meta lines. */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] bg-white" style={{ boxShadow: "var(--shadow-soft)" }}>
      <Skeleton className="aspect-[4/5] w-full !rounded-none" />
      <div className="space-y-3 px-5 py-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 3, label }: { count?: number; label?: string }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <Status label={label} />
      {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

/** Invitation page placeholder: hero photo, title, text lines, button. */
export function InviteSkeleton({ label }: { label?: string }) {
  return (
    <div className="min-h-screen bg-page">
      <Status label={label} />
      <div className="mx-auto max-w-md space-y-5 px-6 py-8">
        <Skeleton className="aspect-[3/4] w-full !rounded-[24px]" />
        <Skeleton className="mx-auto h-9 w-3/4" />
        <Skeleton className="mx-auto h-4 w-1/2" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <Skeleton className="mx-auto h-11 w-2/3 !rounded-full" />
      </div>
    </div>
  );
}

/** Editor placeholder: side dock + phone canvas. */
export function EditorSkeleton({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] gap-4 px-4 py-6">
      <Status label={label} />
      <div className="hidden w-[300px] shrink-0 space-y-3 lg:block">
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-12" />)}
        </div>
        <Skeleton className="h-8 w-2/3" />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="aspect-square w-full" />)}
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mx-auto aspect-[9/16] w-full max-w-[380px] !rounded-[28px]" />
      </div>
    </div>
  );
}

/** Generic list of rows (responses, admin tables). */
export function ListSkeleton({ rows = 5, label }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-3">
      <Status label={label} />
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  );
}
