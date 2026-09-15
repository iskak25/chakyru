export const PUBLIC_SITE_ORIGIN = "https://www.toichakyru.com";

function normalizeOrigin(value?: string | null) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) return "";
    if (["chakyru.vercel.app", "toichakyru.com", "www.toichakyru.com"].includes(url.hostname)) return PUBLIC_SITE_ORIGIN;
    return url.origin;
  } catch { return ""; }
}

export function paymentOrigin(requestUrl: string, configuredUrl?: string) {
  const current = normalizeOrigin(requestUrl);
  // Public checkout must return to the same canonical site, even with stale settings.
  if (current === PUBLIC_SITE_ORIGIN) return current;
  return normalizeOrigin(configuredUrl) || current || PUBLIC_SITE_ORIGIN;
}
