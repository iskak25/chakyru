import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { collectionDesigns } from "@/lib/collectionTemplates";
import { eventArt } from "@/lib/eventArt";
import { eventTypes, mergeCatalogTemplates, templates } from "@/lib/templates";

const publicDir = join(process.cwd(), "public");

describe("catalogue", () => {
  it("has unique template ids", () => {
    const ids = templates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no longer lists the removed Zhentek event", () => {
    expect(eventTypes).not.toContain("jentek");
    expect(templates.filter((t) => t.id.includes("jentek") || t.eventTypes.includes("jentek"))).toHaveLength(0);
  });

  it("keeps Zhentek out of stored catalogues too", () => {
    const stored = [...templates, { ...templates[0], id: "theme-jentek-cradle", eventTypes: ["jentek"] }] as typeof templates;
    expect(mergeCatalogTemplates(stored).some((t) => t.id.includes("jentek"))).toBe(false);
  });

  it("gives every template a name in both languages", () => {
    for (const t of templates) {
      expect(t.name.ky.trim(), t.id).not.toBe("");
      expect(t.name.ru.trim(), t.id).not.toBe("");
    }
  });
});

describe("tushoo collection", () => {
  const tushoo = collectionDesigns.filter((d) => d.event === "tushoo");

  it("has a generated hero and decor file for every design", () => {
    expect(tushoo.length).toBeGreaterThan(0);
    for (const d of tushoo) {
      const art = eventArt(d.id);
      expect(art.hero, d.id).toBeTruthy();
      expect(art.decor, d.id).toBeTruthy();
      expect(existsSync(join(publicDir, art.hero!)), art.hero).toBe(true);
      expect(existsSync(join(publicDir, art.decor!)), art.decor).toBe(true);
    }
  });

  it("uses a different cover for each design", () => {
    const heroes = tushoo.map((d) => eventArt(d.id).hero);
    expect(new Set(heroes).size).toBe(heroes.length);
  });
});

describe("static assets", () => {
  function walk(dir: string, out: string[] = []) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full, out);
      else out.push(full);
    }
    return out;
  }

  it("has no oversized raster files left in public/images (>700 KB)", () => {
    const big = walk(join(publicDir, "images"))
      .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
      .filter((f) => statSync(f).size > 700 * 1024);
    expect(big.map((f) => f.slice(publicDir.length))).toEqual([]);
  });

  it("every /images path referenced from lib data exists", () => {
    const files = ["lib/templateImageSources.json", "lib/templateRestoredImages.json"];
    const missing: string[] = [];
    for (const rel of files) {
      const text = readFileSync(join(process.cwd(), rel), "utf8");
      for (const m of text.matchAll(/\/images\/[A-Za-z0-9_\-\/.]+\.(?:png|jpe?g|webp)/g)) {
        if (!existsSync(join(publicDir, m[0]))) missing.push(m[0]);
      }
    }
    expect(missing).toEqual([]);
  });
});

describe("image paths resolved from template data", () => {
  function collect(value: unknown, out: Set<string>, depth = 0) {
    if (depth > 8 || value == null) return;
    if (typeof value === "string") {
      if (/^\/(images|stickers)\/.+\.(png|jpe?g|webp|svg)$/i.test(value)) out.add(value);
      return;
    }
    if (Array.isArray(value)) return value.forEach((v) => collect(v, out, depth + 1));
    if (typeof value === "object") Object.values(value as object).forEach((v) => collect(v, out, depth + 1));
  }

  it("every local image used by catalogue, themed and reference designs exists", async () => {
    const { pinterestDesigns, themedSiteDesigns } = await import("@/lib/pinterestTemplates");
    const { referenceWeddings } = await import("@/lib/referenceWeddings");
    const paths = new Set<string>();
    for (const source of [templates, pinterestDesigns, themedSiteDesigns, referenceWeddings]) collect(source, paths);
    expect(paths.size).toBeGreaterThan(20);
    const missing = [...paths].filter((p) => !existsSync(join(publicDir, p)));
    expect(missing).toEqual([]);
  });
});

describe("example copy", () => {
  it("does not hard-code a name that differs from the template's own", async () => {
    const { eventExamples } = await import("@/lib/collectionTemplates");
    const own = new Set<string>();
    const commonWords = new Set(["Кубаныч"]); // also the ordinary word "joy", so a prefix match proves nothing
    for (const t of templates) for (const n of String(t.canvas?.names || "").split(/\s*(?:&|жана)\s*/)) if (n.length > 3 && !commonWords.has(n)) own.add(n);
    // Messages are shared by many templates, so they must not mention anyone by name.
    for (const [event, example] of Object.entries(eventExamples)) {
      for (const message of example.message) {
        const hit = [...own].find((name) => message.includes(name.slice(0, Math.max(4, name.length - 2))));
        expect(hit, `${event}: "${message.slice(0, 60)}…" mentions ${hit}`).toBeUndefined();
      }
    }
  });
});
