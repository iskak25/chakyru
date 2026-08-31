"use client";

import { useCallback, useEffect, useState } from "react";
import type { AccountRole, PlanId } from "@/lib/types";
import type { RemoteUser } from "@/lib/db";
import { firebaseIdToken } from "@/lib/firebase";
import { useI18n } from "@/lib/locale";

export function AdminUsers() {
  const { t } = useI18n();
  const [users, setUsers] = useState<RemoteUser[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await firebaseIdToken();
      if (!token) {
        setError(t.admin.login);
        setReady(true);
        return;
      }
      await fetch("/api/me/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}`, "cache-control": "no-store" },
      });
      if (res.status === 401) {
        setError(t.admin.login);
        setReady(true);
        return;
      }
      if (res.status === 403) {
        setError(t.admin.denied);
        setReady(true);
        return;
      }
      if (!res.ok) {
        setError(t.admin.needFirestore);
        setReady(true);
        return;
      }
      const data = (await res.json()) as { users?: RemoteUser[] };
      setUsers(Array.isArray(data.users) ? data.users : []);
      setError("");
      setReady(true);
    } catch {
      setError(t.admin.needFirestore);
      setReady(true);
    }
  }, [t.admin.denied, t.admin.login, t.admin.needFirestore]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(uid: string, body: { plan?: PlanId; accountRole?: AccountRole }) {
    setBusy(uid);
    setError("");
    try {
      const token = await firebaseIdToken();
      if (!token) throw new Error("auth");
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ uid, ...body }),
      });
      if (!res.ok) throw new Error("save");
      await load();
    } catch {
      setError(t.admin.error);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      {error ? <p className="mb-4 text-sm text-rose">{error}</p> : null}
      {!ready ? null : users.length === 0 && !error ? (
        <p className="text-sm text-ink-soft">{t.admin.emptyUsers}</p>
      ) : users.length === 0 ? null : (
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
                      onChange={(e) => void patch(user.firebaseUid, { plan: e.target.value as PlanId })}
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
                      onChange={(e) => void patch(user.firebaseUid, { accountRole: e.target.value as AccountRole })}
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
