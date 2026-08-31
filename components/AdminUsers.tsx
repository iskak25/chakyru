"use client";

import { useEffect, useState } from "react";
import type { AccountRole, PlanId } from "@/lib/types";
import { setUserPlan, setUserRole, watchUsers, type RemoteUser } from "@/lib/db";
import { useI18n } from "@/lib/locale";

export function AdminUsers() {
  const { t } = useI18n();
  const [users, setUsers] = useState<RemoteUser[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const stop = watchUsers(setUsers, () => setError(t.admin.needFirestore));
    if (!stop) setError(t.admin.needFirestore);
    return () => stop?.();
  }, [t.admin.needFirestore]);

  async function changePlan(uid: string, plan: PlanId) {
    setBusy(uid);
    setError("");
    try {
      await setUserPlan(uid, plan);
    } catch {
      setError(t.admin.error);
    } finally {
      setBusy(null);
    }
  }

  async function changeRole(uid: string, accountRole: AccountRole) {
    setBusy(uid);
    setError("");
    try {
      await setUserRole(uid, accountRole);
    } catch {
      setError(t.admin.error);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      {error ? <p className="mb-4 text-sm text-rose">{error}</p> : null}
      {users.length === 0 && !error ? (
        <p className="text-sm text-ink-soft">{t.admin.emptyUsers}</p>
      ) : (
        <div className="overflow-x-auto bg-cream-deep">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-ink/8 text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">{t.admin.name}</th>
                <th className="px-4 py-3 font-medium">{t.admin.email}</th>
                <th className="px-4 py-3 font-medium">{t.admin.plan}</th>
                <th className="px-4 py-3 font-medium">{t.admin.role}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.firebaseUid} className="border-b border-ink/6 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.picture ? (
                        <img src={user.picture} alt="" className="h-8 w-8 rounded-full" />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest/10 text-xs">
                          {user.name.slice(0, 1)}
                        </span>
                      )}
                      <span>{user.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{user.email || "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.plan === "unlimited" ? "pro" : user.plan}
                      disabled={busy === user.firebaseUid}
                      onChange={(e) => void changePlan(user.firebaseUid, e.target.value as PlanId)}
                      className="border border-ink/15 bg-transparent px-3 py-1.5 text-sm"
                    >
                      <option value="free">{t.dash.planFree}</option>
                      <option value="standard">{t.plans.standard.name}</option>
                      <option value="pro">{t.plans.pro.name}</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.accountRole}
                      disabled={busy === user.firebaseUid}
                      onChange={(e) => void changeRole(user.firebaseUid, e.target.value as AccountRole)}
                      className="border border-ink/15 bg-transparent px-3 py-1.5 text-sm"
                    >
                      <option value="user">{t.admin.roleUser}</option>
                      <option value="vip">{t.admin.roleVip}</option>
                      <option value="admin">{t.admin.roleAdmin}</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
