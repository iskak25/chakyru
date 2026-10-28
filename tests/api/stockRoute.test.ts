import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/stock/route";

afterEach(() => vi.unstubAllGlobals());

describe("/api/stock (BUG-04)", () => {
  it("запрос к провайдеру ограничен по времени", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ results: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await GET(new Request("http://x/api/stock?q=toy"));
    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  it("если провайдер не отвечает, возвращает 502, а не вечное ожидание", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("timeout", "TimeoutError")));
    const res = await GET(new Request("http://x/api/stock?q=toy"));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "stock_unavailable" });
  });
});
