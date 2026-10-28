import { beforeEach, describe, expect, it, vi } from "vitest";

const docs: { id: string; ref: object; data: () => Record<string, unknown> }[] = [];
const runTransaction = vi.fn();

vi.mock("@/lib/firebaseAdmin", () => ({
  getAdminDb: () => ({
    collection: () => ({ get: async () => ({ docs }) }),
    runTransaction: (fn: unknown) => runTransaction(fn),
  }),
}));

import { listAdminUsers } from "@/lib/adminUsers";
import { canonicalAccount } from "@/lib/server/users";

function userDoc(id: string, email: string, extra: Record<string, unknown> = {}) {
  const base = { id: `google:${id}`, firebaseUid: id, name: id, email, ...extra };
  const data = { ...base, ...canonicalAccount(base) };
  return { id, ref: { id }, data: () => data };
}

beforeEach(() => { docs.length = 0; runTransaction.mockReset(); });

describe("listAdminUsers", () => {
  it("читает всех одним запросом, без транзакции на каждого пользователя", async () => {
    for (let i = 0; i < 30; i++) docs.push(userDoc(`u${i}`, `u${String(i).padStart(2, "0")}@x.kg`));
    const rows = await listAdminUsers();
    expect(rows).toHaveLength(30);
    expect(runTransaction).not.toHaveBeenCalled();
    expect(rows[0].email).toBe("u00@x.kg");
    expect(rows[29].email).toBe("u29@x.kg");
  });

  it("запись с устаревшей ролью обновляется транзакцией", async () => {
    docs.push(userDoc("a", "a@x.kg"));
    docs.push({ id: "b", ref: { id: "b" }, data: () => ({ id: "google:b", firebaseUid: "b", name: "b", email: "b@x.kg", accountRole: "pro", proExpiresAt: "2000-01-01T00:00:00.000Z" }) });
    runTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        get: async () => ({ exists: true, data: () => ({ id: "google:b", firebaseUid: "b", name: "b", email: "b@x.kg", accountRole: "pro", proExpiresAt: "2000-01-01T00:00:00.000Z" }) }),
        set: vi.fn(),
      };
      return fn(tx);
    });
    const rows = await listAdminUsers();
    expect(runTransaction).toHaveBeenCalledTimes(1);
    expect(rows.map(r => r.email)).toEqual(["a@x.kg", "b@x.kg"]);
    expect(rows[1].accountRole).toBe("guest");
  });
});
