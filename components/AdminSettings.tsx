"use client";

import { useEffect, useState } from "react";
import { authHeaders } from "@/lib/accessClient";
import { useI18n } from "@/lib/locale";

const input = "w-full border border-ink/15 bg-transparent px-3 py-2 text-sm";

type PaymentSettingsView = {
  provider: "finik";
  enabled: boolean;
  finikAccountId: string;
  finikApiKeyConfigured: boolean;
  finikPrivateKeyConfigured: boolean;
  finikApiKeyMasked: string;
  finikPrivateKeyMasked: string;
  finikMcc: string;
  finikBeta: boolean;
  siteUrl: string;
};

export function AdminSettings() {
  const { locale, t } = useI18n();
  const [settings, setSettings] = useState<PaymentSettingsView | null>(null);
  const [newApiKey, setNewApiKey] = useState("");
  const [newPrivateKey, setNewPrivateKey] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const configuredLabel = locale === "ru" ? "Настроен" : "Туташкан";
  const notConfiguredLabel = locale === "ru" ? "Не настроен" : "Туташкан эмес";
  const missingLabel = locale === "ru" ? "Не задан" : "Көрсөтүлгөн эмес";

  async function load() {
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/admin/settings/payments", { headers, cache: "no-store" });
      if (res.status === 401) {
        setError(t.admin.login);
        return;
      }
      if (res.status === 403) {
        setError(t.admin.denied);
        return;
      }
      if (!res.ok) throw new Error("load");
      setSettings((await res.json()) as PaymentSettingsView);
      setError("");
    } catch {
      setError(t.admin.needFirestore);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function patch(partial: Partial<PaymentSettingsView>) {
    setSettings((prev) => (prev ? { ...prev, ...partial } : prev));
    setStatus("");
    setError("");
  }

  async function save() {
    if (!settings) return;
    setBusy(true);
    setStatus("");
    setError("");
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/admin/settings/payments", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          finikAccountId: settings.finikAccountId,
          finikMcc: settings.finikMcc,
          finikBeta: settings.finikBeta,
          siteUrl: settings.siteUrl,
          ...(newApiKey.trim() ? { finikApiKey: newApiKey.trim() } : {}),
          ...(newPrivateKey.trim() ? { finikPrivateKey: newPrivateKey.trim() } : {}),
        }),
      });
      if (res.status === 401) {
        setError(t.admin.login);
        return;
      }
      if (res.status === 403) {
        setError(t.admin.denied);
        return;
      }
      if (!res.ok) throw new Error("save");
      const data = (await res.json()) as { settings?: PaymentSettingsView };
      if (data.settings) setSettings(data.settings);
      setNewApiKey("");
      setNewPrivateKey("");
      setStatus(t.admin.saved);
    } catch {
      setError(t.admin.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <section>
        <h2 className="font-serif text-2xl uppercase">{t.admin.payments}</h2>
        <p className="mt-2 text-sm leading-7 text-ink-soft">{t.admin.finikHint}</p>
        {!settings ? (
          <p className="mt-5 text-sm text-ink-soft">...</p>
        ) : (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-ink-soft">
              Finik: {settings.enabled ? configuredLabel : notConfiguredLabel}
            </p>
            <label className="block text-xs text-ink-soft">
              {t.admin.siteUrl}
              <input
                className={`${input} mt-1`}
                value={settings.siteUrl}
                onChange={(e) => patch({ siteUrl: e.target.value })}
                placeholder="https://chakyru.com"
              />
            </label>
            <label className="block text-xs text-ink-soft">
              FINIK_ACCOUNT_ID
              <input
                className={`${input} mt-1`}
                value={settings.finikAccountId}
                onChange={(e) => patch({ finikAccountId: e.target.value })}
              />
            </label>
            <label className="block text-xs text-ink-soft">
              FINIK_API_KEY
              <span className="mt-1 block text-sm text-ink-soft">
                {settings.finikApiKeyConfigured ? settings.finikApiKeyMasked : missingLabel}
              </span>
              <input
                className={`${input} mt-1`}
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="Новый API key (необязательно)"
                autoComplete="new-password"
              />
            </label>
            <label className="block text-xs text-ink-soft">
              FINIK_PRIVATE_KEY
              <span className="mt-1 block text-sm text-ink-soft">
                {settings.finikPrivateKeyConfigured ? settings.finikPrivateKeyMasked : missingLabel}
              </span>
              <textarea
                rows={8}
                className={`${input} mt-1 font-mono text-[11px]`}
                value={newPrivateKey}
                onChange={(e) => setNewPrivateKey(e.target.value)}
                placeholder="Новый private key (необязательно)"
                autoComplete="new-password"
              />
            </label>
            <label className="block text-xs text-ink-soft">
              FINIK_MCC
              <input
                className={`${input} mt-1`}
                value={settings.finikMcc}
                onChange={(e) => patch({ finikMcc: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.finikBeta}
                onChange={(e) => patch({ finikBeta: e.target.checked })}
              />
              {t.admin.finikBeta}
            </label>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={busy || !settings}
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
