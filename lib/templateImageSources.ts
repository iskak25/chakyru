import sources from "./templateImageSources.json";
import restored from "./templateRestoredImages.json";
import type { ReferenceCrop } from "./referenceWeddings";

type RestoredImage = { source: string; width: number; height: number; fit: "cover" | "contain" };

/** Individual artwork replaces a screenshot fragment, never a user's gallery photo. */
export function restoredTemplateImage(crop?: ReferenceCrop): RestoredImage | undefined {
  if (!crop) return undefined;
  return (restored as Record<string, RestoredImage>)[`${crop.source}|${crop.x},${crop.y},${crop.w},${crop.h}`];
}

/** Same image at source resolution; normalized crop coordinates remain unchanged. */
export function templateImageSource(source: string): string {
  return (sources as Record<string, string>)[source] || source;
}
