import type { InviteFormat } from "./types";
import { youtubeId } from "./music";

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

async function nodeToPng(node: HTMLElement): Promise<string> {
  const { toPng } = await import("html-to-image");
  const restore = flattenComputedColors(node);
  const w = Math.max(1, node.scrollWidth || node.offsetWidth);
  const h = Math.max(1, node.scrollHeight || node.offsetHeight);
  const base = {
    cacheBust: true,
    skipFonts: true,
    backgroundColor: "#0f0c0a",
    width: w,
    height: h,
    imagePlaceholder: PLACEHOLDER,
    filter: (el: Element) => !(el instanceof HTMLElement && el.hasAttribute("data-export-hide")),
  };
  try {
    try {
      return await toPng(node, { ...base, pixelRatio: 2 });
    } catch (first) {
      console.warn("export png@2x failed", first);
      return await toPng(node, { ...base, pixelRatio: 1 });
    }
  } finally {
    restore();
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

async function pngToWebm(png: string, musicUrl?: string): Promise<Blob> {
  const img = await loadImage(png);
  const W = 720;
  const H = 1280;
  const SECS = 7;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const canvasStream = canvas.captureStream(30);
  let stream: MediaStream = canvasStream;
  let audio: HTMLAudioElement | undefined;
  let ac: AudioContext | undefined;

  const canMuxAudio = Boolean(musicUrl) && !youtubeId(musicUrl ?? "");
  if (canMuxAudio && musicUrl) {
    try {
      audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.src = musicUrl;
      audio.loop = true;
      await audio.play();
      ac = new AudioContext();
      const src = ac.createMediaElementSource(audio);
      const dest = ac.createMediaStreamDestination();
      src.connect(dest);
      src.connect(ac.destination);
      stream = new MediaStream([...canvasStream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
    } catch {
      audio?.pause();
      stream = canvasStream;
    }
  }

  const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((t) =>
    MediaRecorder.isTypeSupported(t),
  );
  if (!mime) throw new Error("recorder");

  return new Promise((resolve, reject) => {
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 3_500_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    rec.onerror = () => reject(new Error("record"));
    rec.onstop = () => {
      audio?.pause();
      void ac?.close();
      resolve(new Blob(chunks, { type: "video/webm" }));
    };
    rec.start(120);
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / (SECS * 1000));
      const scale = 1.14 - t * 0.14;
      const ir = img.width / img.height;
      const cr = W / H;
      let dw: number;
      let dh: number;
      if (ir > cr) {
        dh = H * scale;
        dw = dh * ir;
      } else {
        dw = W * scale;
        dh = dw / ir;
      }
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      if (t < 1) requestAnimationFrame(tick);
      else rec.stop();
    };
    requestAnimationFrame(tick);
  });
}

function dataUrlToBlob(dataUrl: string) {
  const [head, body] = dataUrl.split(",");
  const mime = head.match(/data:([^;]+)/)?.[1] || "image/png";
  const bytes = atob(body);
  const buf = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  return new Blob([buf], { type: mime });
}

export async function downloadInvitation(opts: {
  format: InviteFormat;
  names: string;
  musicUrl?: string;
}) {
  const node = document.getElementById(EXPORT_ID);
  if (!(node instanceof HTMLElement)) throw new Error("preview");
  const png = await nodeToPng(node);
  const base = fileBase(opts.names);
  const video = opts.format === "videoMusic" || opts.format === "videoVoice";
  if (!video) {
    saveBlob(dataUrlToBlob(png), `${base}.png`);
    return;
  }
  const blob = await pngToWebm(png, opts.musicUrl);
  saveBlob(blob, `${base}.webm`);
}

export const INVITE_EXPORT_ID = EXPORT_ID;
