import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { eq, inArray } from 'drizzle-orm';
import { buildApp } from '../src/app.js';
import { db } from '../src/db/client.js';
import { pageViews } from '../src/db/schema.js';
import { buildSummary } from '../src/services/digestService.js';

const APPLEBOT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)';
const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36';

const BOT_PATH = '/__test-bot-view';
const HUMAN_PATH = '/__test-human-view';
const DAY = '2000-01-01';
// Its own day, so the counter test can watch activeDays change.
const COUNTER_DAY = '1999-12-31';

/** The beacon inserts fire-and-forget, so wait for the row to land. */
async function waitForView(path: string) {
  for (let i = 0; i < 40; i++) {
    const [row] = await db.select().from(pageViews).where(eq(pageViews.path, path));
    if (row) return row;
    await new Promise((r) => setTimeout(r, 50));
  }
  return undefined;
}

describe('stats', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    await db.delete(pageViews).where(inArray(pageViews.path, [BOT_PATH, HUMAN_PATH]));
    await db.delete(pageViews).where(inArray(pageViews.day, [DAY, COUNTER_DAY]));
  });
  afterAll(async () => {
    await db.delete(pageViews).where(inArray(pageViews.path, [BOT_PATH, HUMAN_PATH]));
    await db.delete(pageViews).where(inArray(pageViews.day, [DAY, COUNTER_DAY]));
    await app.close();
  });

  it('tags a crawler page view as a bot at ingest', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/stats/view',
      remoteAddress: '10.0.0.5',
      headers: { 'user-agent': APPLEBOT },
      payload: { path: BOT_PATH },
    });
    expect(res.statusCode).toBe(202);
    expect(await waitForView(BOT_PATH)).toMatchObject({ isBot: true, botName: 'Applebot' });
  });

  it('tags a browser page view as a person', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/stats/view',
      remoteAddress: '10.0.0.6',
      headers: { 'user-agent': CHROME },
      payload: { path: HUMAN_PATH },
    });
    expect(res.statusCode).toBe(202);
    expect(await waitForView(HUMAN_PATH)).toMatchObject({ isBot: false, botName: null });
  });

  it('leaves bot views out of the public counters but keeps unclassified history', async () => {
    const counters = async () => (await app.inject({ method: 'GET', url: '/stats' })).json();
    const before = await counters();

    // A day with only bot traffic adds nothing - not even an active day.
    await db.insert(pageViews).values({ path: '/__test-counter', day: COUNTER_DAY, isBot: true, botName: 'Applebot' });
    const afterBot = await counters();
    expect(afterBot.totalViews).toBe(before.totalViews);
    expect(afterBot.activeDays).toBe(before.activeDays);
    expect(afterBot.topPaths).toEqual(before.topPaths);

    // Pre-classification rows and people both count.
    await db.insert(pageViews).values([
      { path: '/__test-counter', day: COUNTER_DAY, isBot: null },
      { path: '/__test-counter', day: COUNTER_DAY, isBot: false },
    ]);
    const afterPeople = await counters();
    expect(afterPeople.totalViews).toBe(before.totalViews + 2);
    expect(afterPeople.activeDays).toBe(before.activeDays + 1);
  });

  it('keeps bots and unclassified views out of the digest breakdowns', async () => {
    await db.insert(pageViews).values([
      { path: '/', day: DAY, visitorHash: 'a', isBot: false, city: 'Vancouver', region: 'British Columbia', country: 'Canada', countryCode: 'CA' },
      { path: '/tools/qr', day: DAY, visitorHash: 'a', isBot: false },
      { path: '/resume', day: DAY, visitorHash: 'b', isBot: false },
      { path: '/', day: DAY, visitorHash: 'c', isBot: true, botName: 'Applebot', city: 'Cupertino', region: 'California', country: 'United States', countryCode: 'US' },
      { path: '/blog', day: DAY, visitorHash: 'd', isBot: true, botName: 'Applebot' },
      { path: '/', day: DAY, visitorHash: 'e', isBot: true, botName: 'Googlebot' },
      { path: '/', day: DAY, visitorHash: 'f', isBot: null },
    ]);

    const s = await buildSummary(DAY);
    expect(s).toMatchObject({
      totalViews: 7,
      humanViews: 3,
      humanVisitors: 2,
      botViews: 3,
      unclassifiedViews: 1,
      toolViews: 1,
      locatedViews: 1,
    });
    expect(s.topBots).toEqual([
      { name: 'Applebot', views: 2 },
      { name: 'Googlebot', views: 1 },
    ]);
    expect(s.topCities.map((c) => c.label)).toEqual(['Vancouver, British Columbia, Canada']);
    expect(s.topCountries).toEqual([{ country: 'Canada', views: 1 }]);
    expect(s.topPages.reduce((n, p) => n + p.views, 0)).toBe(3);
  });
});
