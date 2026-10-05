/**
 * Pro-тарифы. Ключ — оплачиваемый период (то, что выбирает покупатель и что хранится в покупке).
 * 6 месяцев за 10 000 сом дают ещё 6 месяцев в подарок: доступ на 12 месяцев.
 * Цена и срок считаются только на сервере из этой таблицы, клиентскому значению не доверяем.
 */
export const PRO_PLANS = {
  1: { priceSom: 1500, grantMonths: 1 },
  6: { priceSom: 10000, grantMonths: 12 },
} as const;

export type ProPlanMonths = keyof typeof PRO_PLANS;

export function isProPlanMonths(value: unknown): value is ProPlanMonths {
  return value === 1 || value === 6;
}

export function proPlanPrice(months: ProPlanMonths): number {
  return PRO_PLANS[months].priceSom;
}

export function proBonusMonths(months: ProPlanMonths): number {
  return PRO_PLANS[months].grantMonths - months;
}

/**
 * Сколько месяцев Pro выдать за сохранённую покупку. Покупки со сроком 3 месяца были созданы
 * до смены тарифов и ещё могут дождаться оплаты: они получают ровно 3 месяца.
 */
export function proGrantMonths(stored: unknown): number {
  if (stored === 6) return PRO_PLANS[6].grantMonths;
  if (stored === 3) return 3;
  return PRO_PLANS[1].grantMonths;
}

/** Срок покупки, как он хранится: 1, 3 (старые) или 6. */
export function normalizeStoredProMonths(stored: unknown): 1 | 3 | 6 {
  return stored === 6 ? 6 : stored === 3 ? 3 : 1;
}
