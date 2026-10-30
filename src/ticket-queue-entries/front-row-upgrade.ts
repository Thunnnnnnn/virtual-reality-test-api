export type TicketQueueEntry = {
  id: string;
  fanId: string;
  fanName: string;
  ticketValue: string | number | null;
  joinedQueueAt: string;
  eventStartsAt: string;
  status: string;
  loyaltyPoints?: number | null;
  upgradesLast30Days?: number | null;
  membership?: string | null;
  phoneNumber?: string | null;
  deviceId?: string | null;
  paymentAccount?: string | null;
};

export type RankedEntry = {
  entry: TicketQueueEntry;
  score: number;
  reasons: string[];
};

export type FanGroup = {
  id: string;
  entries: TicketQueueEntry[];
  representative: RankedEntry | null;
  connectionReasons: string[];
};

export type ExcludedEntry = {
  entry: TicketQueueEntry;
  reason: string;
};

export type FrontRowUpgradeResult = {
  winner: RankedEntry | null;
  topCandidates: RankedEntry[];
  fanGroups: FanGroup[];
  excludedEntries: ExcludedEntry[];
};

export type UpgradeOptions = {
  rushHour?: boolean;
  vipHour?: boolean;
  fairQueue?: boolean;
};

const HOUR_MS = 3_600_000;
const TOP_CANDIDATES = 3;
const MAX_LISTED_IDS = 5;

const LOYALTY_CAP = 1000;
const LOYALTY_DIVISOR = 10;
const TICKET_VALUE_DIVISOR = 200;
const TICKET_VALUE_CAP = 20;
const LONG_WAIT_HOURS = 12;
const LONG_WAIT_BONUS = 20;

type Weights = {
  waitPerHour: number;
  waitCap: number;
  vipBonus: number;
  upgradePenalty: number;
};

function getWeights(options: UpgradeOptions): Weights {
  return {
    waitPerHour: options.rushHour ? 15 : 5,
    waitCap: options.rushHour ? 300 : 100,
    vipBonus: options.vipHour ? 25 : 10,
    upgradePenalty: options.fairQueue ? 25 : 10,
  };
}

export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return digits || null;
}

function normalizeText(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function parseTicketValue(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : value.trim() === '' ? NaN : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getExclusionReason(entry: TicketQueueEntry, nowMs: number): string | null {
  const reasons: string[] = [];
  if (entry.status === 'cancelled') reasons.push('Cancelled entry');
  else if (entry.status === 'upgraded') reasons.push('Already upgraded');
  else if (entry.status !== 'waiting') reasons.push('Invalid status');

  const eventMs = Date.parse(entry.eventStartsAt);
  if (Number.isNaN(eventMs)) reasons.push('Invalid event start time');
  else if (eventMs <= nowMs) reasons.push('Concert already started');

  if (entry.membership === 'blocked') reasons.push('Blocked fan');
  if (parseTicketValue(entry.ticketValue) === null) reasons.push('Invalid ticket value');

  return reasons.length ? reasons.join(', ') : null;
}

class DisjointSet {
  private parent: Int32Array;
  private size: Int32Array;

  constructor(n: number) {
    this.parent = new Int32Array(n);
    this.size = new Int32Array(n).fill(1);
    for (let i = 0; i < n; i++) this.parent[i] = i;
  }

  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]];
      x = this.parent[x];
    }
    return x;
  }

  union(a: number, b: number) {
    let ra = this.find(a);
    let rb = this.find(b);
    if (ra === rb) return;
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
  }
}

type Scored = {
  entry: TicketQueueEntry;
  joinedMs: number;
  loyalty: number;
  wait: number;
  waitHours: number;
  vip: number;
  ticket: number;
  base: number;
};

function compareScored(a: Scored, b: Scored): number {
  if (a.base !== b.base) return b.base - a.base;
  if (a.joinedMs !== b.joinedMs) return a.joinedMs - b.joinedMs;
  return a.entry.id < b.entry.id ? -1 : a.entry.id > b.entry.id ? 1 : 0;
}

function round(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

function scoreEntry(entry: TicketQueueEntry, nowMs: number, w: Weights): Scored {
  const parsedJoined = Date.parse(entry.joinedQueueAt);
  const joinedMs = Number.isNaN(parsedJoined) ? nowMs : parsedJoined;
  const waitHours = Math.max(0, nowMs - joinedMs) / HOUR_MS;

  const loyalty = Math.min(Math.max(entry.loyaltyPoints ?? 0, 0), LOYALTY_CAP) / LOYALTY_DIVISOR;
  const longWaitBonus = waitHours >= LONG_WAIT_HOURS ? LONG_WAIT_BONUS : 0;
  const wait = Math.min(waitHours * w.waitPerHour, w.waitCap) + longWaitBonus;
  const vip = entry.membership === 'vip' ? w.vipBonus : 0;
  const ticket = Math.min(parseTicketValue(entry.ticketValue)! / TICKET_VALUE_DIVISOR, TICKET_VALUE_CAP);

  return { entry, joinedMs, loyalty, wait, waitHours, vip, ticket, base: round(loyalty + wait + vip + ticket) };
}

function buildRanked(s: Scored, groupUpgrades: number, groupSize: number, w: Weights): RankedEntry {
  const penalty = groupUpgrades * w.upgradePenalty;
  const reasons = [
    `Loyalty points: +${round(s.loyalty)}`,
    `Waited ${round(s.waitHours)} hours: +${round(s.wait)}`,
    `Ticket value: +${round(s.ticket)}`,
  ];
  if (s.vip) reasons.push(`VIP membership: +${s.vip}`);
  if (penalty) reasons.push(`${groupUpgrades} upgrades in the last 30 days (whole fan group): -${penalty}`);
  if (groupSize > 1) {
    reasons.push(`Best of ${groupSize} linked accounts; the group counts as one candidate`);
  }
  return { entry: s.entry, score: round(s.base - penalty), reasons };
}

function describeConnections(
  groupSharedKeys: string[],
  shared: Map<string, number[]>,
  items: TicketQueueEntry[],
): string[] {
  return groupSharedKeys.sort().map(key => {
    const [type, ...rest] = key.split(':');
    const label = type === 'phone' ? 'phone number' : type === 'device' ? 'device ID' : 'payment account';
    const ids = shared.get(key)!.map(i => items[i].id).sort();
    const listed = ids.slice(0, MAX_LISTED_IDS).join(', ');
    const more = ids.length > MAX_LISTED_IDS ? ` and ${ids.length - MAX_LISTED_IDS} more` : '';
    return `Same ${label} ${rest.join(':')} (${listed}${more})`;
  });
}

export function buildFrontRowUpgradeQueue(
  entries: readonly TicketQueueEntry[],
  now: Date,
  options: UpgradeOptions = {},
): FrontRowUpgradeResult {
  const nowMs = now.getTime();
  const weights = getWeights(options);

  const excludedEntries: ExcludedEntry[] = [];
  const eligible: TicketQueueEntry[] = [];
  for (const entry of entries) {
    const reason = getExclusionReason(entry, nowMs);
    if (reason) excludedEntries.push({ entry, reason });
    else eligible.push(entry);
  }

  // Link accounts through shared values. Each key maps to its first owner, so this is O(n α(n)).
  const dsu = new DisjointSet(eligible.length);
  const firstOwner = new Map<string, number>();
  const shared = new Map<string, number[]>();
  eligible.forEach((entry, i) => {
    const keys = [
      ['phone', normalizePhone(entry.phoneNumber)],
      ['device', normalizeText(entry.deviceId)],
      ['payment', normalizeText(entry.paymentAccount)],
    ] as const;
    for (const [type, value] of keys) {
      if (!value) continue;
      const key = `${type}:${value}`;
      const owner = firstOwner.get(key);
      if (owner === undefined) {
        firstOwner.set(key, i);
        continue;
      }
      dsu.union(owner, i);
      const members = shared.get(key);
      if (members) members.push(i);
      else shared.set(key, [owner, i]);
    }
  });

  const groups = new Map<number, number[]>();
  eligible.forEach((_, i) => {
    const root = dsu.find(i);
    const members = groups.get(root);
    if (members) members.push(i);
    else groups.set(root, [i]);
  });

  const sharedKeysByRoot = new Map<number, string[]>();
  for (const [key, members] of shared) {
    const root = dsu.find(members[0]);
    const list = sharedKeysByRoot.get(root);
    if (list) list.push(key);
    else sharedKeysByRoot.set(root, [key]);
  }

  const fanGroups: FanGroup[] = [];
  for (const [root, members] of groups) {
    const scored = members.map(i => scoreEntry(eligible[i], nowMs, weights));
    const best = scored.reduce((a, b) => (compareScored(a, b) <= 0 ? a : b));
    const groupUpgrades = scored.reduce((sum, s) => sum + Math.max(s.entry.upgradesLast30Days ?? 0, 0), 0);
    const groupEntries = members.map(i => eligible[i]).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

    fanGroups.push({
      id: `group-${groupEntries[0].id}`,
      entries: groupEntries,
      representative: buildRanked(best, groupUpgrades, members.length, weights),
      connectionReasons: describeConnections(sharedKeysByRoot.get(root) ?? [], shared, eligible),
    });
  }

  const joinedOf = (g: FanGroup) => {
    const parsed = Date.parse(g.representative!.entry.joinedQueueAt);
    return Number.isNaN(parsed) ? nowMs : parsed;
  };
  fanGroups.sort((a, b) => {
    const ra = a.representative!;
    const rb = b.representative!;
    if (ra.score !== rb.score) return rb.score - ra.score;
    const ja = joinedOf(a);
    const jb = joinedOf(b);
    if (ja !== jb) return ja - jb;
    return ra.entry.id < rb.entry.id ? -1 : ra.entry.id > rb.entry.id ? 1 : 0;
  });

  const topCandidates = fanGroups.slice(0, TOP_CANDIDATES).map(g => g.representative!);
  const winner = topCandidates[0] ?? null;
  if (winner) winner.reasons.unshift(`Highest score (${winner.score}) among ${fanGroups.length} fan groups`);

  return { winner, topCandidates, fanGroups, excludedEntries };
}
