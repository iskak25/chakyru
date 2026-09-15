// Finik can append ?paymentId=... even when RedirectUrl already has a query.
// Recover the provider parameters without treating them as part of a template ID.
export function checkoutReturn(query: string) {
  const params = new URLSearchParams(query);
  for (const key of ["template", "plan", "pid"]) {
    const value = params.get(key) || "";
    const separator = value.indexOf("?");
    if (separator < 0) continue;
    params.set(key, value.slice(0, separator));
    for (const [name, nested] of new URLSearchParams(value.slice(separator + 1))) {
      if (!params.has(name)) params.set(name, nested);
    }
  }
  const template = params.get("template") || "";
  return {
    templateId: /^[a-zA-Z0-9_-]+$/.test(template) ? template : "",
    paymentId: params.get("pid") || params.get("paymentId") || params.get("PaymentId") || "",
  };
}

export function paymentReturnHref(paymentId: string, templateId: string) {
  const params = new URLSearchParams({ pid: paymentId });
  if (templateId) params.set("template", templateId);
  return `/pay/return?${params}`;
}
