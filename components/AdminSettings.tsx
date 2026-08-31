"use client";

import { useEffect, useState } from "react";
import { readLocalSettings, saveSiteSettings, watchSiteSettings } from "@/lib/db";
import { useI18n } from "@/lib/locale";
import { defaultSettings, publicPricing } from "@/lib/settings";
import { setLivePricing } from "@/lib/catalogStore";
import type { SiteSettings } from "@/lib/types";

const input = "w-full border border-ink/15 bg-transparent px-3 py-2 text-sm";

export function AdminSettings() {
  const { t } = useI18n();
  const [draft, setDraft] = useState<SiteSettings>(defaultSettings);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(readLocalSettings());
    const stop = watchSiteSettings(setDraft, () => setError(t.admin.needFirestore));
    return () => stop?.();
  }, [t.admin.needFirestore]);

  function patch(partial: Partial<SiteSettings>) {
    setDraft((prev) => ({ ...prev, ...partial }));
    setStatus("");
    setError("");
  }

  async function save() {
    setBusy(true);
    setError("");
    try {
      const result = await saveSiteSettings(draft);
      setLivePricing(publicPricing(draft));
      setStatus(result.remote ? t.admin.saved : t.admin.savedLocal);
    } catch {
      setError(t.admin.error);
      setStatus(t.admin.savedLocal);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <section>
        <h2 className="font-serif text-2xl uppercase">{t.admin.payments}</h2>
        <p className="mt-2 text-sm leading-7 text-ink-soft">{t.admin.finikHint}</p>
        <div className="mt-5 space-y-4">
          <label className="block text-xs text-ink-soft">
            {t.admin.siteUrl}
            <input
              className={`${input} mt-1`}
              value={draft.siteUrl}
              onChange={(e) => patch({ siteUrl: e.target.value })}
              placeholder="https://chakyru.com"
            />
          </label>
          <label className="block text-xs text-ink-soft">
            FINIK_API_KEY
            <input
              className={`${input} mt-1`}
              value={draft.finikApiKey}
              onChange={(e) => patch({ finikApiKey: e.target.value })}
            />
          </label>
          <label className="block text-xs text-ink-soft">
            FINIK_ACCOUNT_ID
            <input
              className={`${input} mt-1`}
              value={draft.finikAccountId}
              onChange={(e) => patch({ finikAccountId: e.target.value })}
            />
          </label>
          <label className="block text-xs text-ink-soft">
            FINIK_MCC
            <input
              className={`${input} mt-1`}
              value={draft.finikMcc}
              onChange={(e) => patch({ finikMcc: e.target.value })}
            />
          </label>
          <label className="block text-xs text-ink-soft">
            FINIK_PRIVATE_KEY
            <textarea
              rows={8}
              className={`${input} mt-1 font-mono text-[11px]`}
              value={draft.finikPrivateKey}
              onChange={(e) => patch({ finikPrivateKey: e.target.value })}
              placeholder="-----BEGIN PRIVATE KEY-----"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.finikBeta}
              onChange={(e) => patch({ finikBeta: e.target.checked })}
            />
            {t.admin.finikBeta}
          </label>
        </div>
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
