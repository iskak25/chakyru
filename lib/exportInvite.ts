import type { InviteFormat } from "./types";

const EXPORT_ID = "chakyru-export";

function fileBase(names: string) {
  const raw = names.trim() || "chakyru";
  return raw.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 48) || "chakyru";
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function toRgb(color: string, fallback = "rgb(15, 12, 10)") {
  const v = color.trim();
  if (!v || v === "transparent" || v === "rgba(0, 0, 0, 0)") return "transparent";
  if (/^#|^rgba?\(|^hsla?\(/i.test(v) && !/oklch|oklab|lab\(|lch\(|color-mix/i.test(v)) return v;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return fallback;
  ctx.fillStyle = "#000";
  ctx.fillStyle = v;
  return typeof ctx.fillStyle === "string" && ctx.fillStyle ? ctx.fillStyle : fallback;
}

function flattenComputedColors(root: HTMLElement) {
  const prev: { el: HTMLElement; css: string | null }[] = [];
  const walk = (el: HTMLElement) => {
    prev.push({ el, css: el.getAttribute("style") });
    const cs = getComputedStyle(el);
    el.style.setProperty("background-color", toRgb(cs.backgroundColor), "important");
    el.style.setProperty("color", toRgb(cs.color, "rgb(245, 245, 245)"), "important");
    el.style.setProperty("border-top-color", toRgb(cs.borderTopColor), "important");
    el.style.setProperty("border-right-color", toRgb(cs.borderRightColor), "important");
    el.style.setProperty("border-bottom-color", toRgb(cs.borderBottomColor), "important");
    el.style.setProperty("border-left-color", toRgb(cs.borderLeftColor), "important");
    el.style.setProperty("outline-color", toRgb(cs.outlineColor), "important");
    el.style.setProperty("text-decoration-color", toRgb(cs.textDecorationColor), "important");
    el.style.setProperty("caret-color", toRgb(cs.caretColor), "important");
    if (/oklch|oklab|lab\(|lch\(|color-mix/i.test(cs.backgroundImage)) {
      el.style.setProperty("background-image", "none", "important");
    }
    if (/oklch|oklab|lab\(|lch\(|color-mix/i.test(cs.boxShadow)) {
      el.style.setProperty("box-shadow", "none", "important");
    }
    if (/oklch|oklab|lab\(|lch\(|color-mix/i.test(cs.textShadow)) {
      el.style.setProperty("text-shadow", "none", "important");
    }
    el.style.setProperty("backdrop-filter", "none", "important");
    el.style.setProperty("-webkit-backdrop-filter", "none", "important");
    el.style.setProperty("animation", "none", "important");
    el.style.setProperty("transition", "none", "important");
    el.style.setProperty("opacity", cs.opacity, "important");
    for (const child of el.children) {
      if (child instanceof HTMLElement) walk(child);
    }
  };
  walk(root);
  return () => {
    for (const { el, css } of prev) {
      if (css == null) el.removeAttribute("style");
      else el.setAttribute("style", css);
    }
  };
}

const PLACEHOLDER =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

async function nodeToJpeg(node: HTMLElement): Promise<string> {
  const { toJpeg } = await import("html-to-image");
  await document.fonts.ready;
  const restore = flattenComputedColors(node);
  const w = Math.max(1, node.scrollWidth || node.offsetWidth);
  const h = Math.max(1, node.scrollHeight || node.offsetHeight);
  const base = {
    quality: 0.95,
    cacheBust: true,
    preferredFontFormat: "woff2",
    backgroundColor: "#0f0c0a",
    width: w,
    height: h,
    imagePlaceholder: PLACEHOLDER,
    filter: (el: Element) => !(el instanceof HTMLElement && el.hasAttribute("data-export-hide")),
  };
  try {
    try {
      return await toJpeg(node, { ...base, pixelRatio: 2 });
    } catch (first) {
      console.warn("export jpg@2x failed", first);
      return await toJpeg(node, { ...base, pixelRatio: 1 });
    }
  } finally {
    restore();
  }
}

function dataUrlToBlob(dataUrl: string) {
  const [head, body] = dataUrl.split(",");
  const mime = head.match(/data:([^;]+)/)?.[1] || "image/jpeg";
  const bytes = atob(body);
  const buf = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  return new Blob([buf], { type: mime });
}

export async function downloadInvitation(opts: {
  format: InviteFormat;
  names: string;
}) {
  const node = document.getElementById(EXPORT_ID);
  if (!(node instanceof HTMLElement)) throw new Error("preview");
  // Export the card at its own aspect ratio, without the taller phone frame.
  const card = node.querySelector<HTMLElement>("[data-invitation-card]");
  const jpg = await nodeToJpeg(card || node);
  const base = fileBase(opts.names);
  saveBlob(dataUrlToBlob(jpg), `${base}.jpg`);
}

export const INVITE_EXPORT_ID = EXPORT_ID;
