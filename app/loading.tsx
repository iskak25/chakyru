import { CardGridSkeleton, Skeleton } from "@/components/Skeleton";

/** Shown by Next.js while any route segment is loading. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8 px-5 py-10">
      <Skeleton className="h-10 w-64" />
      <CardGridSkeleton count={3} />
    </div>
  );
}
