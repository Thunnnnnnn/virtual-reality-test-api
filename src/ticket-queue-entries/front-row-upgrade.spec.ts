import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildFrontRowUpgradeQueue, TicketQueueEntry } from './front-row-upgrade';

const NOW = new Date('2026-10-30T12:00:00+07:00');

let counter = 0;
function make(overrides: Partial<TicketQueueEntry> = {}): TicketQueueEntry {
  counter++;
  return {
    id: `e${counter}`,
    fanId: `f${counter}`,
    fanName: `Fan ${counter}`,
    ticketValue: 2000,
    joinedQueueAt: '2026-10-30T10:00:00+07:00',
    eventStartsAt: '2026-10-30T20:00:00+07:00',
    status: 'waiting',
    loyaltyPoints: 100,
    upgradesLast30Days: 0,
    membership: 'regular',
    phoneNumber: null,
    deviceId: null,
    paymentAccount: null,
    ...overrides,
  };
}

function reasonOf(result: ReturnType<typeof buildFrontRowUpgradeQueue>, id: string) {
  return result.excludedEntries.find(x => x.entry.id === id)?.reason;
}

describe('buildFrontRowUpgradeQueue', () => {
  it('cancelled entries cannot win', () => {
    const cancelled = make({ id: 'c', status: 'cancelled', loyaltyPoints: 1000 });
    const ok = make({ id: 'ok', loyaltyPoints: 1 });
    const result = buildFrontRowUpgradeQueue([cancelled, ok], NOW);
    assert.equal(result.winner?.entry.id, 'ok');
    assert.equal(reasonOf(result, 'c'), 'Cancelled entry');
  });

  it('already upgraded entries cannot win', () => {
    const upgraded = make({ id: 'u', status: 'upgraded' });
    const result = buildFrontRowUpgradeQueue([upgraded], NOW);
    assert.equal(result.winner, null);
    assert.equal(reasonOf(result, 'u'), 'Already upgraded');
  });

  it('entries after the concert start time cannot win', () => {
    const started = make({ id: 's', eventStartsAt: '2026-10-30T11:59:59+07:00', loyaltyPoints: 1000 });
    const exactlyNow = make({ id: 'n', eventStartsAt: NOW.toISOString() });
    const ok = make({ id: 'ok', loyaltyPoints: 1 });
    const result = buildFrontRowUpgradeQueue([started, exactlyNow, ok], NOW);
    assert.equal(result.winner?.entry.id, 'ok');
    assert.equal(reasonOf(result, 's'), 'Concert already started');
    assert.equal(reasonOf(result, 'n'), 'Concert already started');
  });

  it('blocked fans cannot win', () => {
    const blocked = make({ id: 'b', membership: 'blocked', loyaltyPoints: 1000 });
    const ok = make({ id: 'ok', loyaltyPoints: 1 });
    const result = buildFrontRowUpgradeQueue([blocked, ok], NOW);
    assert.equal(result.winner?.entry.id, 'ok');
    assert.equal(reasonOf(result, 'b'), 'Blocked fan');
  });

  it('invalid, zero or negative ticket values cannot win', () => {
    const values: (string | number | null)[] = ['invalid', 0, '0', -5, '-5', null, '', NaN, Infinity];
    const bad = values.map((v, i) => make({ id: `bad${i}`, ticketValue: v, loyaltyPoints: 1000 }));
    const ok = make({ id: 'ok', ticketValue: '3000', loyaltyPoints: 1 });
    const result = buildFrontRowUpgradeQueue([...bad, ok], NOW);
    assert.equal(result.winner?.entry.id, 'ok');
    for (const b of bad) assert.equal(reasonOf(result, b.id), 'Invalid ticket value');
  });

  it('different phone formatting connects entries', () => {
    const a = make({ id: 'a', phoneNumber: '081-234-5678' });
    const b = make({ id: 'b', phoneNumber: '081 234 5678' });
    const c = make({ id: 'c', phoneNumber: ' 0812345678' });
    const result = buildFrontRowUpgradeQueue([a, b, c], NOW);
    assert.equal(result.fanGroups.length, 1);
    assert.equal(result.fanGroups[0].entries.length, 3);
    assert.match(result.fanGroups[0].connectionReasons[0], /phone number/);
  });

  it('indirect connections create one fan group', () => {
    const a = make({ id: 'a', phoneNumber: '0811111111' });
    const b = make({ id: 'b', phoneNumber: '081-111-1111', deviceId: 'dev-1' });
    const c = make({ id: 'c', deviceId: 'dev-1', paymentAccount: 'pay-1' });
    const d = make({ id: 'd', paymentAccount: 'pay-1' });
    const other = make({ id: 'x', phoneNumber: '0999999999' });
    const result = buildFrontRowUpgradeQueue([d, c, other, b, a], NOW);
    assert.equal(result.fanGroups.length, 2);
    const group = result.fanGroups.find(g => g.entries.length === 4)!;
    assert.deepEqual(group.entries.map(e => e.id), ['a', 'b', 'c', 'd']);
    assert.equal(group.connectionReasons.length, 3);
  });

  it('the same input always gives the same winner and does not mutate the input', () => {
    const entries = [
      make({ id: 'a', loyaltyPoints: 50 }),
      make({ id: 'b', loyaltyPoints: 50 }),
      make({ id: 'c', loyaltyPoints: 50 }),
    ];
    const snapshot = JSON.stringify(entries);
    const first = buildFrontRowUpgradeQueue(entries, NOW);
    const reversed = buildFrontRowUpgradeQueue([...entries].reverse(), NOW);
    assert.equal(JSON.stringify(entries), snapshot);
    assert.deepEqual(first, buildFrontRowUpgradeQueue(entries, NOW));
    assert.equal(first.winner?.entry.id, reversed.winner?.entry.id);
  });

  it('empty values never connect accounts', () => {
    const entries = [
      make({ id: 'a', phoneNumber: '', deviceId: '  ', paymentAccount: null }),
      make({ id: 'b', phoneNumber: ' - ', deviceId: '', paymentAccount: null }),
      make({ id: 'c', phoneNumber: null, deviceId: null, paymentAccount: '' }),
    ];
    const result = buildFrontRowUpgradeQueue(entries, NOW);
    assert.equal(result.fanGroups.length, 3);
  });

  it('a large linked group does not beat a stronger single fan', () => {
    const many = Array.from({ length: 20 }, (_, i) =>
      make({ id: `m${i}`, phoneNumber: '0811111111', loyaltyPoints: 100 }),
    );
    const single = make({ id: 'single', loyaltyPoints: 300 });
    const result = buildFrontRowUpgradeQueue([...many, single], NOW);
    assert.equal(result.winner?.entry.id, 'single');
    assert.equal(result.fanGroups.length, 2);
    assert.equal(result.topCandidates.length, 2);
  });

  it('recent upgrades of every linked account reduce the group score', () => {
    const a = make({ id: 'a', phoneNumber: '0811111111', upgradesLast30Days: 2 });
    const b = make({ id: 'b', phoneNumber: '0811111111', upgradesLast30Days: 3 });
    const solo = make({ id: 'solo', upgradesLast30Days: 0 });
    const result = buildFrontRowUpgradeQueue([a, b, solo], NOW);
    assert.equal(result.winner?.entry.id, 'solo');
  });

  it('ties are broken by earlier join time, then by id', () => {
    const late = make({ id: 'a', joinedQueueAt: '2026-10-30T11:00:00+07:00', loyaltyPoints: 100 });
    const early = make({ id: 'z', joinedQueueAt: '2026-10-30T11:00:00+07:00', loyaltyPoints: 100 });
    assert.equal(buildFrontRowUpgradeQueue([early, late], NOW).winner?.entry.id, 'a');

    const first = make({ id: 'b', joinedQueueAt: '2026-10-30T11:00:00+07:00', loyaltyPoints: 100, ticketValue: 2000 });
    const second = make({ id: 'a', joinedQueueAt: '2026-10-30T11:00:00+07:00', loyaltyPoints: 100, ticketValue: 2000 });
    assert.equal(buildFrontRowUpgradeQueue([first, second], NOW).winner?.entry.id, 'a');
  });

  it('collects every exclusion reason and keeps excluded entries in the result', () => {
    const bad = make({ id: 'bad', status: 'cancelled', membership: 'blocked', ticketValue: 0 });
    const result = buildFrontRowUpgradeQueue([bad], NOW);
    assert.equal(reasonOf(result, 'bad'), 'Cancelled entry, Blocked fan, Invalid ticket value');
  });

  it('modes change priority: rush hour favours long waiters, VIP hour favours VIPs', () => {
    const waiter = make({ id: 'waiter', joinedQueueAt: '2026-10-30T04:00:00+07:00', loyaltyPoints: 0, ticketValue: 200 });
    const loyal = make({ id: 'loyal', joinedQueueAt: '2026-10-30T11:30:00+07:00', loyaltyPoints: 400, ticketValue: 200 });
    assert.equal(buildFrontRowUpgradeQueue([waiter, loyal], NOW).winner?.entry.id, 'loyal');
    assert.equal(buildFrontRowUpgradeQueue([waiter, loyal], NOW, { rushHour: true }).winner?.entry.id, 'waiter');

    const vip = make({ id: 'vip', membership: 'vip', loyaltyPoints: 100 });
    const regular = make({ id: 'regular', loyaltyPoints: 115 });
    assert.equal(buildFrontRowUpgradeQueue([vip, regular], NOW).winner?.entry.id, 'vip');
    const noVipBoost = buildFrontRowUpgradeQueue([vip, regular], NOW, { vipHour: true });
    assert.ok(noVipBoost.winner!.score > buildFrontRowUpgradeQueue([vip], NOW).winner!.score);
  });

  it('fair queue mode penalises recent upgrades more', () => {
    const heavy = make({ id: 'heavy', loyaltyPoints: 400, upgradesLast30Days: 2 });
    const light = make({ id: 'light', loyaltyPoints: 100, upgradesLast30Days: 0 });
    assert.equal(buildFrontRowUpgradeQueue([heavy, light], NOW).winner?.entry.id, 'heavy');
    assert.equal(buildFrontRowUpgradeQueue([heavy, light], NOW, { fairQueue: true }).winner?.entry.id, 'light');
  });

  it('returns a null winner when nobody is eligible and handles empty input', () => {
    assert.equal(buildFrontRowUpgradeQueue([], NOW).winner, null);
    const result = buildFrontRowUpgradeQueue([make({ status: 'cancelled' })], NOW);
    assert.equal(result.winner, null);
    assert.equal(result.fanGroups.length, 0);
  });

  it('handles 500,000 entries in a reasonable time', () => {
    const base = Date.parse('2026-10-30T08:00:00+07:00');
    const entries: TicketQueueEntry[] = Array.from({ length: 500_000 }, (_, i) => ({
      id: `p${i}`,
      fanId: `f${i}`,
      fanName: `Fan ${i}`,
      ticketValue: 1000 + (i % 50) * 100,
      joinedQueueAt: new Date(base + (i % 1000) * 1000).toISOString(),
      eventStartsAt: '2026-10-30T20:00:00+07:00',
      status: 'waiting',
      loyaltyPoints: i % 500,
      upgradesLast30Days: i % 3,
      membership: i % 10 === 0 ? 'vip' : 'regular',
      phoneNumber: `08${String(i % 200_000).padStart(8, '0')}`,
      deviceId: `dev-${i % 150_000}`,
      paymentAccount: i % 7 === 0 ? null : `pay-${i % 300_000}`,
    }));
    const start = Date.now();
    const result = buildFrontRowUpgradeQueue(entries, NOW);
    const elapsed = Date.now() - start;
    assert.ok(result.winner);
    assert.ok(elapsed < 15_000, `took ${elapsed}ms`);
    console.log(`500k entries: ${elapsed}ms, ${result.fanGroups.length} groups`);
  });
});
