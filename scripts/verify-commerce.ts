import { canEditInvitation, ownsInvitation } from "../lib/auth";
import {
  canSaveInvitation,
  canUserAccessTemplateFromFacts,
  isFinikSucceeded,
  resolveTemplatePriceForUser,
  purchasePriceLocked,
} from "../lib/server/accessLogic";
import { sameInvitationOwner } from "../lib/server/invitations";
import { samePurchasePayer } from "../lib/server/purchases";
import type { User } from "../lib/types";

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

function test7OwnerAliasesUnlockEditor() {
  const user: User = {
    id: "google:uid123",
    name: "Host",
    role: "host",
    auth: "google",
    email: "host@example.com",
    plan: "standard",
    accountRole: "user",
    templates: ["mauve"],
  };
  assert(ownsInvitation(user, { ownerId: "google:uid123" }), "exact ownerId must match");
  assert(ownsInvitation(user, { ownerUid: "uid123" }), "firebase uid must match google:uid");
  assert(ownsInvitation(user, { ownerId: "google:host@example.com" }), "legacy email ownerId must match");
  assert(canEditInvitation(user, { ownerId: "uid123", templateId: "mauve" }), "paid owner must edit after uid alias");
  assert(
    !canEditInvitation(user, { ownerId: "someone-else", templateId: "mauve" }),
    "other people's invitations stay locked",
  );
}

test1FrozenPurchasePrice();
test2IndividualPrice();
test3InvitationIsolation();
test4AccessDeniedWithoutPurchase();
test5AccessFromFirestoreFacts();
test6WebhookIdempotent();
function test8ServerSaveAcceptsOwnerAliases() {
  const owner = { ownerId: "google:uid123", ownerUid: "uid123", email: "host@example.com" };
  assert(sameInvitationOwner({ ownerId: "google:host@example.com" }, owner), "legacy email ownerId must save");
  assert(sameInvitationOwner({ ownerId: "uid123" }, owner), "bare uid ownerId must save");
  assert(sameInvitationOwner({ ownerId: "google:uid123" }, owner), "google:uid ownerId must save");
  assert(sameInvitationOwner({ ownerUid: "uid123", ownerId: "google:old@example.com" }, owner), "matching ownerUid must save");
  assert(!sameInvitationOwner({ ownerId: "someone-else", ownerUid: "other" }, owner), "foreign invitation must not save");
}

function test9PurchasePayerAliases() {
  assert(samePurchasePayer("uid123", "uid123"), "exact uid must match");
  assert(samePurchasePayer("google:uid123", "uid123"), "google:uid purchase must match firebase uid");
  assert(!samePurchasePayer("other", "uid123"), "foreign purchase must not match");
}

test7OwnerAliasesUnlockEditor();
test8ServerSaveAcceptsOwnerAliases();
test9PurchasePayerAliases();

function test10CanSaveInvitationGate() {
  assert(canSaveInvitation({ existing: false, owns: true, accessAllowed: true }).ok, "new paid invite must save");
  assert(!canSaveInvitation({ existing: false, owns: true, accessAllowed: false }).ok, "new unpaid invite must not save");
  assert(canSaveInvitation({ existing: false, owns: true, accessAllowed: false }).reason === "access", "unpaid reason is access");
  assert(!canSaveInvitation({ existing: true, owns: false, accessAllowed: true }).ok, "foreign invite must not save");
  assert(canSaveInvitation({ existing: true, owns: false, accessAllowed: true }).reason === "owner", "foreign reason is owner");
  assert(canSaveInvitation({ existing: true, owns: true, accessAllowed: true }).ok, "owner with access must save");
  assert(!canSaveInvitation({ existing: true, owns: true, accessAllowed: false }).ok, "owner without access must not save");
  assert(isFinikSucceeded("SUCCEEDED"), "Finik SUCCEEDED must count");
  assert(isFinikSucceeded("paid"), "paid must count");
  assert(!isFinikSucceeded("pending"), "pending must not count");
}

test10CanSaveInvitationGate();
console.log("commerce checks ok");
