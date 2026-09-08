# CreativeAds — Implementation Plan

## 1. Existing architecture

- **Stack:** Next.js 16 App Router, React 19, Tailwind 4, Firebase Auth + Firestore Admin
- **Auth:** Google ID token (`Authorization: Bearer`), `lib/firebaseToken.ts`
- **Templates:** `lib/templates.ts` + Firestore `catalog/templates`
- **Access:** `lib/server/access.ts` (purchase / pro / vip / admin / free)
- **Payments:** Finik purchases — **no credit ledger today**
- **Nav:** Header menu only (`components/Header.tsx`) — **no app sidebar**
- **Shell:** `SiteShell` (Header + Footer)
- **Design:** cream `#efe8dc`, ink `#1c1814`, terracotta gold `#9c4a32`, Cormorant + Manrope
- **Images:** `public/images/templates/{id}/`, data URLs in invitations; no Firebase Storage uploads yet

## 2. Integration decisions

| Topic | Decision |
|-------|----------|
| Sidebar | CreativeAds **section layout** with left nav (design requires it). Main site keeps Header. Link “CreativeAds · New” added to Header menu. |
| Credits | New field `users.creativeCredits`. Pro/VIP/admin = unlimited. Others start with 3; each generate costs 1. |
| Templates | Reuse live catalog — no duplicate DB |
| AI | Provider abstraction; default **LocalCompositionProvider** (composes template hero + scene + copy). Ready for real image API later |
| Storage | Firestore `creativeAds` + result metadata; preview URLs from template assets / composed data URLs |
| Auth | Same Google Bearer checks; ownership on every API |

## 3. Files to create

```
CREATIVEADS_PLAN.md
app/creativeads/layout.tsx
app/creativeads/page.tsx
app/creativeads/templates/page.tsx
app/creativeads/create/page.tsx
app/creativeads/generate/page.tsx
app/creativeads/results/[jobId]/page.tsx
app/creativeads/editor/[id]/page.tsx
app/creativeads/my/page.tsx
app/api/creativeads/route.ts
app/api/creativeads/generate/route.ts
app/api/creativeads/[id]/route.ts
app/api/creativeads/credits/route.ts
components/creativeads/*
lib/creativeAds/*
lib/server/creativeAds.ts
```

## 4. Files to modify

- `components/Header.tsx` — nav item + New badge
- `lib/i18n.ts` — ky/ru copy
- `lib/types.ts` — CreativeAds types + credits on User
- `app/templates/[id]/page.tsx` — “Создать рекламу”
- `app/globals.css` — CreativeAds tokens (espresso / antique gold) scoped under `.creativeads`

## 5. Database (Firestore)

Collection `creativeAds/{id}`:

- userId, templateId, style, format, language, eventType
- status: `pending | generating | ready | failed`
- title, subtitle, cta, favorite
- variants: `[{ id, style, imageUrl, prompt }]`
- prompt, createdAt, updatedAt

User: `creativeCredits?: number`

## 6. API

| Method | Path | Role |
|--------|------|------|
| GET | `/api/creativeads` | list mine |
| POST | `/api/creativeads/generate` | start job (auth + access + credit) |
| GET | `/api/creativeads/[id]` | get job (owner) |
| PATCH | `/api/creativeads/[id]` | edit / favorite |
| DELETE | `/api/creativeads/[id]` | delete |
| GET | `/api/creativeads/credits` | balance |

## 7. UI architecture

Luxury Editorial studio: espresso sidebar + cream workspace + serif headlines + antique gold accents. Routes under `/creativeads/*`.

## 8. AI architecture

`CreativeAdsProvider.generate(input) → variants[]`  
Prompt builder in `lib/creativeAds/prompt.ts` (environment-only; invitation design frozen).  
Local provider returns 4 styled compositions from template hero + scene presets.

## 9. Security

Bearer auth; ownership; template access via `ensurePaidTemplateAccess`; credit check; no secrets on client.

## 10. Phases

1. Plan + tokens + layout  
2. Home / templates / create  
3. Generate / results / editor / my / download  
4. APIs + credits  
5. Template CTA + i18n + responsive + lint/build  
