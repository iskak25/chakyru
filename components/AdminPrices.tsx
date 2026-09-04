"use client";

import { useEffect, useRef, useState } from "react";
import { authHeaders } from "@/lib/accessClient";
import { setLivePricing, setLiveTemplates } from "@/lib/catalogStore";
import { getFirebaseAuth } from "@/lib/firebase";
import { useI18n } from "@/lib/locale";
import { defaultSettings, publicPricing } from "@/lib/settings";
import { useCatalog } from "@/lib/useCatalog";
import { mergeCatalogTemplates } from "@/lib/templates";
import { readLocalSettings, watchSiteSettings } from "@/lib/db";
import type { InvitationTemplate, SiteSettings } from "@/lib/types";

const input = "w-full border border-ink/15 bg-transparent px-3 py-2 text-sm";

type UserPriceRow = { userId: string; templateId: string; price: number };

export function AdminPrices() {
  const { locale, t } = useI18n();
  const { templates } = useCatalog();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [rows, setRows] = useState<InvitationTemplate[]>([]);
  const [userPrices, setUserPrices] = useState<UserPriceRow[]>([]);
  const [userId, setUserId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [specialPrice, setSpecialPrice] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dirty = useRef(false);

  useEffect(() => {
    setSettings(readLocalSettings());
    const stop = watchSiteSettings((next) => {
      if (dirty.current) return;
      setSettings(next);
    }, () => setError(t.admin.needFirestore));
    return () => stop?.();
  }, [t.admin.needFirestore]);

  useEffect(() => {
    if (dirty.current || !templates.length) return;
    setRows(mergeCatalogTemplates(templates).map((item) => structuredClone(item)));
  }, [templates]);

  useEffect(() => {
    if (!templateId && rows[0]) setTemplateId(rows[0].id);
  }, [rows, templateId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await getFirebaseAuth()?.authStateReady();
      const headers = await authHeaders();
      const res = await fetch("/api/admin/prices", { headers, cache: "no-store" });
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { userPrices?: UserPriceRow[] };
      if (Array.isArray(data.userPrices)) setUserPrices(data.userPrices);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function setPro(value: number) {
    dirty.current = true;
    setSettings((prev) => ({ ...prev, proPriceSom: value }));
    setStatus("");
    setError("");
  }

  function setRow(id: string, value: number) {
    dirty.current = true;
    setRows((prev) => prev.map((item) => (item.id === id ? { ...item, priceSom: value } : item)));
    setStatus("");
    setError("");
  }

  async function save() {
    setBusy(true);
    setError("");
    try {
      const headers = await authHeaders();
      const prices = Object.fromEntries(rows.map((item) => [item.id, item.priceSom]));
      const res = await fetch("/api/admin/prices", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ prices, proPriceSom: settings.proPriceSom }),
      });
      if (!res.ok) throw new Error("save");
      setLiveTemplates(rows);
      setLivePricing(publicPricing(settings));
      dirty.current = true;
      setStatus(t.admin.saved);
    } catch {
      setError(t.admin.error);
    } finally {
      setBusy(false);
    }
  }

  async function saveUserPrice() {
    if (!userId.trim() || !templateId) return;
    setBusy(true);
    setError("");
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/admin/prices", {
        method: "POST",
        headers,
        body: JSON.stringify({ userId: userId.trim(), templateId, price: specialPrice }),
      });
      if (!res.ok) throw new Error("save");
      setUserPrices((prev) => {
        const next = prev.filter((row) => !(row.userId === userId.trim() && row.templateId === templateId));
        return [{ userId: userId.trim(), templateId, price: specialPrice }, ...next];
      });
      setStatus(t.admin.saved);
    } catch {
      setError(t.admin.error);
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

      <section>
        <h2 className="font-serif text-2xl uppercase">{t.admin.userPrice}</h2>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{t.admin.userPriceHint}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="text-xs text-ink-soft">
            {t.admin.userId}
            <input className={`${input} mt-1`} value={userId} onChange={(e) => setUserId(e.target.value)} />
          </label>
          <label className="text-xs text-ink-soft">
            {t.admin.templates}
            <select className={`${input} mt-1`} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              {rows.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name[locale]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-ink-soft">
            {t.admin.specialPrice}
            <input
              type="number"
              min={0}
              className={`${input} mt-1`}
              value={specialPrice}
              onChange={(e) => setSpecialPrice(Number(e.target.value) || 0)}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveUserPrice()}
          className="mt-4 border border-ink/15 px-5 py-2 text-[11px] uppercase tracking-[0.16em] disabled:opacity-60"
        >
          {t.admin.save}
        </button>
        {userPrices.length > 0 ? (
          <ul className="mt-5 space-y-2 text-sm text-ink-soft">
            {userPrices.map((row) => (
              <li key={`${row.userId}_${row.templateId}`}>
                {row.userId} · {row.templateId} · {row.price}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="bg-forest px-6 py-2.5 text-[11px] uppercase tracking-[0.16em] text-cream disabled:opacity-60"
        >
          {busy ? t.admin.saving : t.admin.save}
        </button>
        {status ? <p className="text-sm text-ink-soft">{status}</p> : null}
        {error ? <p className="text-sm text-rose">{error}</p> : null}
      </div>
    </div>
  );
}
