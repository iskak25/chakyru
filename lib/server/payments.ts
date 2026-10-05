import { canUserAccessTemplate, getTemplatePriceForUser } from "./access";
import { createPurchase, findOpenPurchase } from "./purchases";
import type { PlanId } from "../types";
import { isProPlanMonths, proPlanPrice } from "../proPlans";

export async function quoteCheckout(input: {
  uid: string;
  plan: Exclude<PlanId, "free">;
  templateId?: string;
  proPriceSom?: number;
  proMonths?: number;
}) {
  if (input.plan === "pro" || input.plan === "unlimited") {
    const months = input.proMonths ?? 1;
    if (!isProPlanMonths(months)) return { error: "months" as const };
    // Цена — из таблицы тарифов (1500 / 10 000 с подарком), а не из настройки месячной цены.
    return { amount: proPlanPrice(months), granted: false as const };
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
