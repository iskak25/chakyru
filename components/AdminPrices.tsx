"use client";

import { useEffect, useState } from "react";
import { readLocalSettings, saveCatalogTemplates, saveSiteSettings, watchSiteSettings } from "@/lib/db";
import { setLivePricing, setLiveTemplates } from "@/lib/catalogStore";
import { useI18n } from "@/lib/locale";
import { defaultSettings, publicPricing } from "@/lib/settings";
import { useCatalog } from "@/lib/useCatalog";
import { mergeCatalogTemplates } from "@/lib/templates";
import type { InvitationTemplate, SiteSettings } from "@/lib/types";

const input = "w-full border border-ink/15 bg-transparent px-3 py-2 text-sm";

export function AdminPrices() {
  const { locale, t } = useI18n();
  const { templates } = useCatalog();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [rows, setRows] = useState<InvitationTemplate[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSettings(readLocalSettings());
    const stop = watchSiteSettings(setSettings, () => setError(t.admin.needFirestore));
    return () => stop?.();
  }, [t.admin.needFirestore]);

  useEffect(() => {
    setRows(mergeCatalogTemplates(templates).map((item) => structuredClone(item)));
  }, [templates]);

  function setPro(value: number) {
    setSettings((prev) => ({ ...prev, proPriceSom: value }));
    setStatus("");
    setError("");
  }

  function setRow(id: string, value: number) {
    setRows((prev) => prev.map((item) => (item.id === id ? { ...item, priceSom: value } : item)));
    setStatus("");
    setError("");
  }

  async function save() {
    setBusy(true);
    setError("");
    try {
      const [catalog, site] = await Promise.all([saveCatalogTemplates(rows), saveSiteSettings(settings)]);
      setLiveTemplates(rows);
      setLivePricing(publicPricing(settings));
      setStatus(catalog.remote && site.remote ? t.admin.saved : t.admin.savedLocal);
    } catch {
      setError(t.admin.error);
      setStatus(t.admin.savedLocal);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <p className="text-sm leading-7 text-ink-soft">{t.admin.pricesHint}</p>

      <section>
        <h2 className="font-serif text-2xl uppercase">Pro</h2>
        <div className="mt-5 max-w-xs">
          <label className="text-xs text-ink-soft">
            {t.admin.proPriceSom}
            <input
              type="number"
              min={0}
              className={`${input} mt-1`}
              value={settings.proPriceSom}
              onChange={(e) => setPro(Number(e.target.value) || 0)}
            />
          </label>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl uppercase">{t.admin.templates}</h2>
        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">{t.admin.emptyTemplates}</p>
        ) : (
          <div className="mt-5 overflow-x-auto bg-cream-deep">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="border-b border-ink/8 text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">{t.admin.name}</th>
                  <th className="px-4 py-3 font-medium">{t.admin.priceSom}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-b border-ink/6 last:border-0">
                    <td className="px-4 py-3">
                      <p>{item.name[locale]}</p>
                      <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-meta">{item.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        className={input}
                        value={item.priceSom}
                        onChange={(e) => setRow(item.id, Number(e.target.value) || 0)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="bg-forest px-6 py-2.5 text-[11px] uppercase tracking-[0.16em] text-cream disabled:opacity-60"
        >
          {t.admin.save}
        </button>
        {status ? <p className="text-sm text-ink-soft">{status}</p> : null}
        {error ? <p className="text-sm text-rose">{error}</p> : null}
      </div>
    </div>
  );
}
