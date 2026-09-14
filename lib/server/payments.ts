import { canUserAccessTemplate, getTemplatePriceForUser } from "./access";
import { createPurchase, findOpenPurchase } from "./purchases";
import type { PlanId } from "../types";

export async function quoteCheckout(input: {
  uid: string;
  plan: Exclude<PlanId, "free">;
  templateId?: string;
  proPriceSom: number;
  proMonths?: number;
}) {
  if (input.plan === "pro" || input.plan === "unlimited") {
    const months = input.proMonths ?? 1;
    if (months !== 1 && months !== 3) return { error: "months" as const };
    return { amount: input.proPriceSom * months, granted: false as const };
  }
  const templateId = input.templateId?.trim() || "";
  if (!templateId) return { error: "template" as const };
  const access = await canUserAccessTemplate(input.uid, templateId);
  if (access.allowed) {
    return { amount: 0, granted: true as const, templateId };
  }
  const amount = await getTemplatePriceForUser(input.uid, templateId);
  if (amount == null) return { error: "template" as const };
  return { amount, granted: false as const, templateId };
}

export async function openCheckout(input: {
  uid: string;
  plan: Exclude<PlanId, "free">;
  amount: number;
  templateId?: string;
  proMonths?: number;
}) {
  const existing = await findOpenPurchase(input.uid, { plan: input.plan, templateId: input.templateId, proMonths: input.proMonths, amount: input.amount });
  if (existing) return existing.id;
  const paymentId = crypto.randomUUID();
  await createPurchase({
    paymentId,
    uid: input.uid,
    plan: input.plan,
    amount: input.amount,
    templateId: input.templateId,
    proMonths: input.proMonths,
  });
  return paymentId;
}
