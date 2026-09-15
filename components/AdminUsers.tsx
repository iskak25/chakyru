"use client";

import { useCallback, useEffect, useState } from "react";
import type { RemoteUser } from "@/lib/db";
import { firebaseIdToken } from "@/lib/firebase";
import { useI18n } from "@/lib/locale";
import { effectiveAccount } from "@/lib/proAccess";
import { adminUserErrorMessage } from "@/lib/adminUserErrors";

type Role = "guest" | "pro" | "admin";
export function AdminUsers() {
  const { t, locale } = useI18n();
  const ru = locale === "ru";
  const [users, setUsers] = useState<RemoteUser[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { role: Role; months: number }>>({});
  const [now, setNow] = useState(Date.now());
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await firebaseIdToken();
      if (!token) throw new Error(t.admin.login);
      const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!res.ok) {
        const failure = await res.json().catch(() => null);
        throw new Error(res.status === 401 ? t.admin.login : res.status === 403 ? t.admin.denied : adminUserErrorMessage(failure?.error, ru, t.admin.needFirestore));
      }
      const data = await res.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.needFirestore);
    } finally { setReady(true); setLoading(false); }
  }, [t.admin.login, t.admin.denied, t.admin.needFirestore, ru]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function save(user: RemoteUser, role: Role, months: number) {
    setBusy(user.firebaseUid); setError("");
    try {
      const token = await firebaseIdToken();
      if (!token) throw new Error("auth");
      const response = await fetch("/api/admin/users", {
        method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.firebaseUid, accountRole: role, proMonths: months }),
      });
      if (!response.ok) throw new Error("save");
      setDrafts(current => { const next = { ...current }; delete next[user.firebaseUid]; return next; });
      await load();
    } catch { setError(t.admin.error); }
    finally { setBusy(null); }
  }
  const label = (role: string) => role === "admin" ? t.admin.roleAdmin : role === "pro" ? "Pro" : ru ? "Гость" : "Конок";
  return <div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-ink-soft">{ru ? "Ручное назначение Pro — на месяц. Можно выбрать 3 месяца. По окончании срока роль станет «Гость»." : "Pro дайындоо — 1 айга. 3 айды да тандасаңыз болот. Мөөнөтү бүткөндө роль «Конок» болот."}</p>
      <button type="button" disabled={loading || busy !== null} onClick={() => void load()} className="border border-ink/20 px-4 py-2 text-sm disabled:opacity-50">{loading ? (ru ? "Загрузка…" : "Жүктөлүүдө…") : ru ? "Обновить пользователей" : "Колдонуучуларды жаңыртуу"}</button>
    </div>
    {error && <p role="alert" className="mb-4 text-sm text-rose">{error}</p>}
    {ready && !users.length && !error && <p className="text-sm text-ink-soft">{t.admin.emptyUsers}</p>}
    {!!users.length && <div className="overflow-x-auto bg-cream-deep"><table className="w-full min-w-[850px] text-left text-sm">
      <thead className="border-b border-ink/10 text-xs text-ink-soft"><tr>
        {[t.admin.name, t.admin.email, t.admin.role, ru ? "Pro действует до" : "Pro мөөнөтү", ru ? "Изменить роль" : "Ролду өзгөртүү"].map(title => <th key={title} className="px-4 py-3 font-medium">{title}</th>)}
      </tr></thead>
      <tbody>{users.map(user => {
        const currentRole = effectiveAccount(user, now).accountRole as Role;
        const draft = drafts[user.firebaseUid] || { role: currentRole, months: 1 };
        const disabled = busy !== null || loading || user.protectedAdmin;
        const change = (patch: Partial<typeof draft>) => setDrafts(current => ({ ...current, [user.firebaseUid]: { ...draft, ...patch } }));
        return <tr key={user.firebaseUid} className="border-b border-ink/10">
          <td className="px-4 py-4">{user.name || "—"}</td><td className="px-4 py-4">{user.email || "—"}</td>
          <td className="px-4 py-4 font-medium">{label(currentRole)}</td>
          <td className="px-4 py-4">{user.proExpiresAt && Number.isFinite(Date.parse(user.proExpiresAt)) ? <><time dateTime={user.proExpiresAt}>{new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Bishkek" }).format(new Date(user.proExpiresAt))}</time><small className="block text-ink-soft">{ru ? "Время Бишкека" : "Бишкек убактысы"}</small>{currentRole === "guest" && <small className="block">{ru ? "Срок истёк" : "Мөөнөтү бүттү"}</small>}</> : "—"}</td>
          <td className="px-4 py-4"><div className="flex flex-wrap items-center gap-2">
            <select aria-label={ru ? "Новая роль" : "Жаңы роль"} value={draft.role} disabled={disabled} onChange={e => change({ role: e.target.value as Role })} className="border border-ink/20 bg-transparent p-2">
              <option value="guest">{label("guest")}</option><option value="pro">Pro</option><option value="admin">{label("admin")}</option>
            </select>
            {draft.role === "pro" && <select aria-label={ru ? "Срок Pro" : "Pro мөөнөтү"} value={draft.months} disabled={disabled} onChange={e => change({ months: Number(e.target.value) })} className="border border-ink/20 bg-transparent p-2"><option value={1}>{ru ? "1 месяц" : "1 ай"}</option><option value={3}>{ru ? "3 месяца" : "3 ай"}</option></select>}
            <button type="button" disabled={disabled} onClick={() => void save(user, draft.role, draft.months)} className="bg-forest px-3 py-2 text-cream disabled:opacity-40">{busy === user.firebaseUid ? "…" : ru ? "Применить" : "Сактоо"}</button>
          </div></td>
        </tr>;
      })}</tbody>
    </table></div>}
  </div>;
}
