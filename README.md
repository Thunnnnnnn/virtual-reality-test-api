# Front Row Upgrade Queue API

NestJS 11 + Prisma 5.22 (PostgreSQL). The ranking logic is a pure function in
[`src/ticket-queue-entries/front-row-upgrade.ts`](src/ticket-queue-entries/front-row-upgrade.ts):

```ts
buildFrontRowUpgradeQueue(entries, now, options?) // -> { winner, topCandidates, fanGroups, excludedEntries }
```

It does not touch the database, `Date.now()` or the input array.

## Run

```bash
npm install
cp .env.example .env          # set DATABASE_URL
docker-compose up -d --build  # set DATABASE_POSTGRES
npm run prisma:migrate
npm run prisma:seed           # sample entries
npm run start:dev             # http://localhost:8080
```

`GET /ticket-queue-entries/front-row-upgrade-result` accepts optional query params:
`now` (ISO date, used by the UI's "+5 min / +15 min / +1 hour" buttons), `rushHour`, `vipHour`, `fairQueue` (`true`/`false`).
Loyalty points can be changed with `PATCH /ticket-queue-entries/:id`.

## Tests

```bash
npm test
```

Covers every rule in the brief, plus edge cases: empty values never link accounts, a large group cannot beat a stronger
single fan, recent upgrades are counted for the whole group, tie-breaks, all-ineligible input, and a 500,000-entry run
(about 1.5 s on a laptop).

## README questions

**1. How does the priority score work?**
`score = loyalty + waiting + VIP + ticket value − recent-upgrade penalty`
- Loyalty: `min(points, 1000) / 10` (0–100).
- Waiting: 5 points per hour, capped at 100. A fan who has waited 12 hours or more gets an extra +20 (fairness for long waiters).
- VIP: +10.
- Ticket value: `min(value / 200, 20)`.
- Penalty: 10 per upgrade in the last 30 days.

The winner's `reasons` list each component.

**2. How do you stop one fan group from dominating?**
Linked accounts become one group and only the group's best account is a candidate, so extra accounts add nothing.
The recent-upgrade penalty uses the sum of `upgradesLast30Days` over every account in the group, so a group cannot
avoid it by spreading upgrades across accounts.

**3. How do you break ties?**
Higher score, then earlier `joinedQueueAt`, then smaller `id`. Scores are rounded to 4 decimals first so floating-point
noise cannot decide a tie. Input order never matters.

**4. What is the time complexity of the grouping logic?**
Union-Find over hash maps of phone, device and payment values: `O(n·α(n))`, effectively linear, plus `O(g log g)` to rank
`g` groups. No entry is compared with every other entry.

**5. One case where the system may still feel unfair?**
Two real people who share a device or payment account (family, shared phone, internet café) are treated as one fan.
A single person using different phone, device and payment values for each account is not detected.

**6. How do Rush Hour, VIP Hour and Fair Queue Mode work?**
- Rush Hour: waiting is worth 15 points per hour (cap 300) instead of 5 (cap 100).
- VIP Hour: the VIP bonus rises from +10 to +25.
- Fair Queue: the recent-upgrade penalty rises from 10 to 25 per upgrade.

They can be combined.

**7. What would you improve with more time?**
- Normalise international phone formats (`+66 81…` vs `081…`).
- Make weights configurable and tune them with real data.
- Add a way to link accounts by `fanId` or manual review, and report how strong each link is.
- Run an end-to-end test against a real database and add a UI.
