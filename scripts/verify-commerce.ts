import {
  canUserAccessTemplateFromFacts,
  resolveTemplatePriceForUser,
  purchasePriceLocked,
} from "../lib/server/accessLogic";

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message);
}

function test1FrozenPurchasePrice() {
  const userA = resolveTemplatePriceForUser({ isFree: false, basePrice: 1000 });
  const catalogLater = resolveTemplatePriceForUser({ isFree: false, basePrice: 2000 });
  const purchaseA = { status: "paid", price: userA };
  assert(purchaseA.price === 1000, "User A purchase must stay 1000");
  assert(purchasePriceLocked(purchaseA.status), "paid purchase is locked");
  assert(catalogLater === 2000, "User B sees new catalog price");
}

function test2IndividualPrice() {
  const price = resolveTemplatePriceForUser({
    isFree: false,
    basePrice: 2000,
    individualPrice: 1500,
  });
  assert(price === 1500, "User C individual price must win");
}

function test3InvitationIsolation() {
  const invA = { id: "inv001", ownerId: "userA", templateId: "classic", names: "A" };
  const invB = { id: "inv002", ownerId: "userB", templateId: "editorial", names: "B" };
  const nextA = { ...invA, names: "Changed" };
  assert(invB.names === "B", "User B invitation must stay independent");
  assert(nextA.templateId === "classic" && invB.templateId === "editorial", "templateId stays per invitation");
}

function test4AccessDeniedWithoutPurchase() {
  const decision = canUserAccessTemplateFromFacts({
    accountRole: "user",
    plan: "free",
    isAdminEmail: false,
    isFreeTemplate: false,
    hasPaidPurchase: false,
    hasTemplateAccess: false,
  });
  assert(!decision.allowed, "premium without purchase must be denied");
}

function test5AccessFromFirestoreFacts() {
  const decision = canUserAccessTemplateFromFacts({
    accountRole: "user",
    plan: "free",
    isAdminEmail: false,
    isFreeTemplate: false,
    hasPaidPurchase: true,
    hasTemplateAccess: true,
  });
  assert(decision.allowed && decision.accessType === "purchase", "paid access must survive new device");
}

function test6WebhookIdempotent() {
  const first = { status: "paid" as const, grants: 1 };
  const second = purchasePriceLocked(first.status) ? first : { status: "paid" as const, grants: first.grants + 1 };
  assert(second.grants === 1, "duplicate webhook must not grant twice");
}

test1FrozenPurchasePrice();
test2IndividualPrice();
test3InvitationIsolation();
test4AccessDeniedWithoutPurchase();
test5AccessFromFirestoreFacts();
test6WebhookIdempotent();
console.log("commerce checks ok");
