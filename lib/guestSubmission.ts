export type GuestFeedbackKind = "rsvp" | "wish" | "both" | "error" | "preview";
export const GUEST_FEEDBACK_EVENT = "chakyru-guest-feedback";

export function guestFeedback(kind: GuestFeedbackKind) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(GUEST_FEEDBACK_EVENT, { detail: kind }));
}

/** Only acknowledge a submission after the API confirms a saved record. */
export async function guestFetch(url: string, options: RequestInit, notify = true): Promise<Response> {
  if (/\/invitations\/(?:demo|preview(?:-[^/]*)?)\//.test(url)) {
    if (notify) guestFeedback("preview");
    throw new Error("preview");
  }
  try {
    const response = await fetch(url, options);
    const data = await response.clone().json();
    const wish = url.endsWith("/wish");
    if (!response.ok || !(wish ? data.wish?.id : data.guest?.id)) throw new Error("submission-failed");
    const body = typeof options.body === "string" ? JSON.parse(options.body) : {};
    if (notify) guestFeedback(wish ? "wish" : typeof body.wish === "string" && body.wish.trim() ? "both" : "rsvp");
    return response;
  } catch (error) {
    if (notify) guestFeedback("error");
    throw error;
  }
}

const submitting = new WeakSet<HTMLFormElement>();
export async function completeGuestForm(form: HTMLFormElement, action: () => Promise<unknown>): Promise<boolean> {
  if (submitting.has(form)) return false;
  submitting.add(form);
  form.setAttribute("aria-busy", "true");
  const buttons = Array.from(form.querySelectorAll<HTMLButtonElement>('button[type="submit"]'));
  const previous = buttons.map(button => button.disabled);
  buttons.forEach(button => { button.disabled = true; });
  try { await action(); return true; }
  catch { return false; }
  finally {
    submitting.delete(form); form.removeAttribute("aria-busy");
    buttons.forEach((button, i) => { button.disabled = previous[i]; });
  }
}
