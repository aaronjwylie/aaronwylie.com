import { describe, it, expect } from 'vitest';
import { detectBot } from '../src/lib/bots.js';

// User-agents taken from real page-view beacons in the production nginx logs.
const CRAWLERS: [string, string][] = [
  [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)',
    'Applebot',
  ],
  ['Mozilla/5.0 (compatible; Baiduspider-render/2.0; +http://www.baidu.com/search/spider.html)', 'Baiduspider'],
  [
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/136.0.0.0 Safari/537.36',
    'Bingbot',
  ],
  [
    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.8010.36 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Googlebot',
  ],
  [
    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.7922.173 Mobile Safari/537.36 (compatible; GoogleOther)',
    'GoogleOther',
  ],
  [
    '"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"',
    'Malformed user-agent',
  ],
  ['Python/3.12 aiohttp/3.13.5', 'Other bot'],
  ['SomeNewCrawler/1.0 (+https://example.com/crawler)', 'Other bot'],
  ['', 'No user-agent'],
];

const BROWSERS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 26_5_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/437.4.973319807 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.2 Safari/605.1.15',
  // A phone model containing "bot" must not trip the catch-all.
  'Mozilla/5.0 (Linux; Android 10; CUBOT X30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
];

describe('detectBot', () => {
  it.each(CRAWLERS)('classifies %s', (ua, name) => {
    expect(detectBot(ua)).toBe(name);
  });

  it.each(BROWSERS)('treats %s as a person', (ua) => {
    expect(detectBot(ua)).toBeNull();
  });
});
