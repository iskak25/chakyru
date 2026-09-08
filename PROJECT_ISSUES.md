# Ошибки и план исправлений Chakyru

Дата аудита: 2026-09-08

Документ составлен по текущему коду проекта. В рамках аудита код не изменялся.

## Как читать приоритеты

- **CRITICAL** — немедленная угроза безопасности, деньгам или данным. Нельзя выходить в production до исправления.
- **HIGH** — серьезный риск обхода доступа, потери данных или нестабильной бизнес-логики. Исправить до активного запуска.
- **MEDIUM** — важная архитектурная или эксплуатационная проблема. Можно исправлять после блокирующих проблем.
- **LOW** — технический долг, UX-недочет или улучшение, которое не блокирует работу сервиса.

---

# 1. Критические проблемы

## C-001. Публичный доступ к платежным секретам

**Уровень:** CRITICAL  
**Файлы:** `firestore.rules`, `lib/db.ts`, `components/AdminSettings.tsx`

В правилах есть закрытое правило для `catalog/payments`, но ниже общее правило `catalog/{docId}` разрешает публичное чтение. В Firestore разрешения не работают как deny-overrides, поэтому общий public read может открыть документ `catalog/payments`.

В этом документе хранятся:

- `finikApiKey`;
- `finikAccountId`;
- `finikPrivateKey`.

Кроме того, настройки читаются клиентским Firebase SDK и сохраняются в `localStorage`.

**Риск:** утечка платежного private key, подмена или злоупотребление платежным API.

**Что сделать:**

1. Немедленно закрыть public read для `catalog/payments`.
2. Перенести платежные secrets только в server environment или Secret Manager.
3. Удалить secrets из client-side `SiteSettings`.
4. Убрать их из `AdminSettings` realtime listener.
5. Ротировать Finik API key и private key, если они уже были сохранены в production Firestore.

---

## C-002. Пользователь может менять чувствительные поля собственного профиля

**Уровень:** CRITICAL  
**Файл:** `firestore.rules`

Обычному пользователю разрешено обновлять собственный документ, если сохраняются только `accountRole`, `plan` и `templates`. Остальные поля не ограничены достаточно строго.

Потенциально можно менять:

- `email`;
- `id`;
- `firebaseUid`;
- `creativeCredits`;
- другие служебные поля.

В серверной логике admin определяется, в том числе, по email из Firestore-профиля:

- `lib/server/users.ts`;
- `lib/adminUsers.ts`;
- `lib/auth.ts`.

**Риск:** privilege escalation, получение admin-доступа или бесплатных CreativeAds credits, подмена идентичности пользователя.

**Что сделать:**

1. Запретить пользователю менять `email`, `id`, `firebaseUid`, `accountRole`, `plan`, `templates`, `creativeCredits`.
2. Разрешить обычному пользователю менять только безопасные поля профиля.
3. Admin определять по UID или серверному role field, а не по изменяемому email.
4. Все изменения plan, role и credits выполнять только через server API/Admin SDK.
5. Проверить и исправить уже существующие профили.

---

## C-003. Finik webhook принимает успешную оплату без строгой проверки заказа

**Уровень:** CRITICAL  
**Файлы:** `app/api/pay/webhook/route.ts`, `lib/server/purchases.ts`, `lib/finik.ts`

Подпись webhook проверяется, но fulfillment продолжает работу, даже если сумма callback отличается от исходной суммы покупки. Несовпадение только записывается в log.

Не выполняются полноценные проверки:

- сумма callback против frozen purchase price;
- `accountId`;
- plan;
- template ID;
- merchant/payment context;
- свежесть timestamp;
- повторное использование старого callback.

**Риск:** выдача доступа при некорректной сумме или повторном callback.

**Что сделать:**

1. При несовпадении суммы немедленно отклонять fulfillment.
2. Сверять callback с исходным payment record.
3. Проверять account ID и order metadata.
4. Проверять timestamp freshness.
5. Добавить replay protection и журнал обработанных webhook events.
6. Сделать fulfillment строго idempotent.
7. Покрыть webhook тестами с неверной суммой, order ID и повтором callback.

---

# 2. Высокие проблемы

## H-001. Draft invitations доступны публично

**Уровень:** HIGH  
**Файлы:** `app/api/invitations/[id]/route.ts`, `lib/server/invitations.ts`

GET endpoint возвращает invitation без проверки `status`. Публично могут быть доступны документы со статусом `draft` или `archived`.

**Риск:** утечка незавершенного или скрытого приглашения.

**Исправление:** для публичного endpoint разрешать только `status === "published"`. Для владельца и админа сделать отдельный защищенный endpoint.

---

## H-002. Public RSVP, wishes и likes не защищены от спама

**Уровень:** HIGH  
**Файлы:**

- `app/api/invitations/[id]/rsvp/route.ts`;
- `app/api/invitations/[id]/wish/route.ts`;
- `app/api/invitations/[id]/like/route.ts`;
- `lib/server/invitations.ts`.

Нет rate limit, captcha/anti-spam механизма, ограничений длины и проверки частоты запросов.

Likes можно увеличивать бесконечно. Проверка существования `wishId` также недостаточно строгая для защиты от злоупотреблений.

**Риск:** спам, рост Firestore costs, накрутка статистики и переполнение документов.

**Исправление:**

1. Добавить rate limiting по IP и invitation ID.
2. Ограничить длину имени, текста и количество записей.
3. Добавить антиспам-защиту.
4. Ограничить один like от одного клиента/идентификатора.
5. Проверять, что invitation опубликован.

---

## H-003. Потеря данных при параллельных RSVP и wishes

**Уровень:** HIGH  
**Файл:** `lib/server/invitations.ts`

Гости и пожелания хранятся массивами внутри invitation. Код делает read-modify-write:

```text
read document
modify array
write document
```

При двух одновременных запросах последняя запись может затереть изменения первой.

**Исправление:** использовать transaction/atomic operations или вынести guests и wishes в отдельные subcollections.

---

## H-004. Invitation сохраняется из клиента почти без schema validation

**Уровень:** HIGH  
**Файлы:** `app/api/invitations/route.ts`, `lib/server/invitations.ts`

PUT принимает почти весь клиентский объект `Invitation`. Не проверяются полноценно:

- размер payload;
- допустимые layout values;
- URL;
- цвета;
- количество extras;
- длина текстов;
- структура guests/wishes;
- внешние media URLs.

**Риск:** повреждение данных, чрезмерные Firestore documents, вредные внешние ссылки и отказ сохранения.

**Исправление:** добавить runtime schema validation, whitelist полей и ограничения размера.

---

## H-005. Локальное состояние может обходить или скрывать серверную модель доступа

**Уровень:** HIGH  
**Файлы:** `lib/store.ts`, `lib/payAccess.ts`, `lib/auth.ts`, `app/create/[id]/page.tsx`

В браузере сохраняются:

- пользователь;
- invitations;
- paid template flags;
- pending payment data.

Редактор дополнительно ориентируется на local state, хотя server save проверяет доступ.

**Риск:** некорректное отображение доступа, рассинхронизация разных устройств и сложные edge cases после очистки браузера.

**Исправление:** сервер сделать единственным источником права доступа. `localStorage` оставить только как offline cache/draft.

---

## H-006. Payment и purchase хранятся дублированно без общей транзакции

**Уровень:** HIGH  
**Файлы:** `lib/server/purchases.ts`, `lib/server/payments.ts`

Одна покупка записывается одновременно в `payments` и `purchases`. Записи выполняются отдельными операциями через `Promise.all`, но не в общей Firestore transaction.

**Риск:** одна коллекция обновилась, другая нет; доступ и статус оплаты расходятся.

**Исправление:** выбрать одну canonical collection либо использовать транзакционную state machine и reconciliation job.

---

## H-007. Admin settings и каталог сохраняются через client Firestore SDK

**Уровень:** HIGH  
**Файлы:**

- `components/AdminTemplates.tsx`;
- `components/AdminLessons.tsx`;
- `components/AdminSettings.tsx`;
- `lib/db.ts`.

Часть admin mutations идет через защищенные API, а часть напрямую из браузера. Это создает две разные модели validation и permissions.

**Риск:** неконсистентные данные, обход серверной валидации, конфликтующие изменения администраторов.

**Исправление:** перевести все admin writes на server API/Admin SDK. Добавить versioning и optimistic locking для каталога.

---

# 3. Средние проблемы

## M-001. Нет runtime validation в CreativeAds

**Уровень:** MEDIUM  
**Файлы:** `app/api/creativeads/generate/route.ts`, `app/api/creativeads/[id]/route.ts`, `lib/server/creativeAds.ts`

Значения `style`, `format`, `language`, `eventType`, title, colors, font size и align фактически проверяются только TypeScript-типами.

**Исправление:** добавить runtime schemas и ограничения строк, чисел и enum values.

---

## M-002. Нет idempotency key для CreativeAds generation

**Уровень:** MEDIUM  
**Файл:** `lib/server/creativeAds.ts`

Повторный запрос может несколько раз списать credit и создать несколько рекламных объектов.

**Исправление:** принимать idempotency key, хранить его вместе с generation job и возвращать существующий результат.

---

## M-003. Credit может потеряться при промежуточном сбое

**Уровень:** MEDIUM  
**Файл:** `lib/server/creativeAds.ts`

Credit списывается до создания draft. Если запись draft упадет до блока восстановления, credit может не вернуться.

**Исправление:** создать job и списание в единой транзакционной модели либо использовать ledger операций.

---

## M-004. Нет Firebase Storage для пользовательских файлов

**Уровень:** MEDIUM  
**Файлы:** `lib/db.ts`, `lib/store.ts`, `components/EditorDock.tsx`

Data/blob URLs удаляются перед сохранением в Firestore. Постоянное хранилище uploads не реализовано.

**Исправление:** подключить Firebase Storage, ограничения MIME/size и сохранять storage URLs.

---

## M-005. Stock proxy можно использовать без авторизации и rate limit

**Уровень:** MEDIUM  
**Файл:** `app/api/stock/route.ts`

Endpoint проксирует Pexels/Unsplash/Openverse и может расходовать внешнюю API quota без ограничений.

**Исправление:** добавить rate limit, cache, query limits и при необходимости auth.

---

## M-006. Нет централизованного logging и monitoring

**Уровень:** MEDIUM  
**Файлы:** API routes и server services.

Логи используют `console.info`, `console.error`, но нет структурированного журнала payment, auth, admin и webhook событий.

**Исправление:** добавить structured logging, correlation ID, error reporting и alerting для payment/webhook failures.

---

## M-007. Нет backup/restore и reconciliation procedures

**Уровень:** MEDIUM  
**Область:** Firestore и payments.

В проекте нет documented backup strategy, восстановления и регулярной сверки pending/paid records.

**Исправление:** настроить Firestore backups, staging project, restore test и reconciliation job.

---

# 4. Низкие проблемы и технический долг

## L-001. Дублирование catalog и access логики

**Уровень:** LOW  

Есть параллельные client/server реализации в:

- `lib/auth.ts`;
- `lib/server/access.ts`;
- `lib/server/accessLogic.ts`;
- `lib/store.ts`;
- `lib/payAccess.ts`.

**Исправление:** оставить server logic canonical, client использовать только для UI состояния.

---

## L-002. Крупные компоненты

**Уровень:** LOW  

Особенно крупные зоны:

- `components/EditorDock.tsx`;
- `components/FormatInvite.tsx`;
- `components/Site3D.tsx`;
- `components/AdminTemplates.tsx`;
- `components/creativeads/DownloadModal.tsx`.

**Исправление:** разделять по feature boundaries после закрытия security и payment issues.

---

## L-003. Hardcoded данные и URL

**Уровень:** LOW  

Найдено в:

- `lib/templates.ts`;
- `lib/store.ts`;
- `components/Footer.tsx`;
- `app/pay/return/page.tsx`;
- `next.config.ts`.

Примеры:

- цены шаблонов;
- demo names и dates;
- WhatsApp URL;
- Instagram URL;
- production domain;
- 2GIS URL.

**Исправление:** перенести изменяемые значения в settings/config/catalog.

---

## L-004. Неиспользуемые или неполные функции

**Уровень:** LOW  

Неполностью реализованы или требуют пересмотра:

- favorite templates;
- полноценные uploads;
- refund workflow;
- внешний AI provider для CreativeAds;
- часть Google auth callback flow.

---

## L-005. Недостаток автоматических тестов

**Уровень:** LOW, но важен перед production  

Есть `scripts/verify-commerce.ts`, однако нет полноценного test framework, E2E и payment integration tests.

**Исправление:** добавить unit, integration и E2E tests для auth, access, payments, invitations и admin.

---

# 5. Правильный порядок исправлений

## Этап 1. Немедленно закрыть утечку secrets

**Менять:**

- `firestore.rules`;
- `lib/db.ts`;
- `components/AdminSettings.tsx`;
- `lib/settings.ts`.

**Сделать:**

1. Запретить public read `catalog/payments`.
2. Оставить secrets только на server side.
3. В Admin UI показывать только masked status, а не private key.
4. Ротировать Finik credentials.
5. Проверить production Firestore вручную.

**Риск:** старые настройки перестанут читаться клиентом, поэтому нужна серверная миграция.

---

## Этап 2. Зафиксировать permissions пользователей

**Менять:**

- `firestore.rules`;
- `lib/server/users.ts`;
- `lib/adminUsers.ts`;
- `lib/auth.ts`;
- `/api/me/sync`.

**Сделать:**

1. Запретить self-edit системных полей.
2. Перестать определять admin по Firestore email.
3. Все plan/role/credits менять только через server API.
4. Проверить профили с подозрительными значениями.

**Риск:** потребуется исправление legacy user records.

---

## Этап 3. Укрепить payment flow

**Менять:**

- `app/api/pay/route.ts`;
- `app/api/pay/webhook/route.ts`;
- `app/api/pay/confirm/route.ts`;
- `lib/finik.ts`;
- `lib/server/purchases.ts`;
- `lib/server/payments.ts`.

**Сделать:**

1. Добавить strict amount/account/order validation.
2. Добавить replay protection.
3. Добавить payment event log.
4. Сделать fulfillment idempotent.
5. Добавить reconciliation для pending платежей.
6. Протестировать success/fail/cancel/retry/refund сценарии.

**Риск:** неправильная миграция статусов может повлиять на уже оплаченных пользователей.

---

## Этап 4. Сделать сервер источником истины

**Менять:**

- `lib/store.ts`;
- `lib/db.ts`;
- `lib/payAccess.ts`;
- `lib/useInviteHistory.ts`;
- `lib/accessClient.ts`.

**Сделать:**

1. `localStorage` использовать только как cache/draft.
2. Не считать локальный paid flag доказательством оплаты.
3. Не показывать `saved`, пока remote save не подтвержден.
4. Убрать local catalog priority над Firestore.
5. Добавить conflict handling.

**Риск:** изменится поведение offline-пользователей.

---

## Этап 5. Исправить public invitation API

**Менять:**

- `app/api/invitations/[id]/route.ts`;
- RSVP/wish/like routes;
- `lib/server/invitations.ts`.

**Сделать:**

1. Публично отдавать только published invitations.
2. Добавить schema validation и payload limits.
3. Добавить rate limiting.
4. Заменить массивные read-modify-write операции на transactions/subcollections.
5. Валидировать URL и media fields.

**Риск:** старые приглашения с неполным status потребуют миграции.

---

## Этап 6. Унифицировать Admin API

**Менять:**

- `components/AdminTemplates.tsx`;
- `components/AdminLessons.tsx`;
- `components/AdminSettings.tsx`;
- `components/AdminPrices.tsx`;
- `lib/db.ts`;
- `app/api/admin/*`.

**Сделать:**

1. Все writes проводить через API.
2. Добавить server-side validation.
3. Добавить audit log.
4. Добавить optimistic locking/version field.
5. Разделить public catalog и private settings.

**Риск:** возможны конфликты при переходе со старой client write модели.

---

## Этап 7. Добавить Storage и медиа-политику

**Менять:**

- `components/EditorDock.tsx`;
- `lib/media.ts`;
- `lib/store.ts`;
- Firebase Storage configuration.

**Сделать:**

1. Загружать файлы в Firebase Storage.
2. Проверять MIME type и размер.
3. Сохранять только storage URLs.
4. Настроить cleanup удаленных файлов.

**Риск:** потребуется миграция старых data/blob URLs.

---

## Этап 8. Production readiness

**Сделать:**

1. Добавить unit tests для access/payment logic.
2. Добавить webhook integration tests.
3. Добавить E2E purchase flow.
4. Добавить security headers и CSP.
5. Добавить monitoring и alerting.
6. Настроить backups и restore test.
7. Провести responsive и performance audit.
8. Провести dependency и secret scan.

**Риск:** потребуется staging environment, отдельный Firebase project и Finik sandbox.

---

# 6. Минимальный release gate

Проект нельзя считать готовым к production, пока не выполнены все пункты:

- [ ] Finik secrets недоступны клиенту.
- [ ] Public read для `catalog/payments` закрыт.
- [ ] Пользователь не может менять role/plan/credits/email.
- [ ] Admin определяется серверно по надежному идентификатору.
- [ ] Webhook сверяет сумму, order и account.
- [ ] Webhook имеет replay protection.
- [ ] Доступ к платному шаблону выдается только после подтвержденной оплаты.
- [ ] Draft invitations не видны публично.
- [ ] Public endpoints имеют rate limiting.
- [ ] RSVP и wishes не теряются при конкурентных запросах.
- [ ] Admin writes проходят через server API.
- [ ] Есть backup и restore procedure.
- [ ] Пройдены payment, auth и invitation tests.

---

# 7. Краткий итог

Главные блокирующие проблемы:

1. возможная публичная утечка Finik private key;
2. возможность изменения чувствительных полей пользовательского профиля;
3. неполная проверка Finik webhook;
4. публичная выдача draft invitations;
5. отсутствие защиты public interaction endpoints;
6. рассинхронизация localStorage и Firestore.

Сначала нужно закрыть безопасность и платежи. После этого перейти к единому источнику данных, invitation API, админке и только затем к рефакторингу компонентов и UX.
