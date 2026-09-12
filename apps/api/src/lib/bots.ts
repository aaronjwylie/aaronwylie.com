/**
 * Classify a page view's user-agent as a crawler. The view beacon only fires
 * once a page's JavaScript runs, but the big search crawlers render pages fully,
 * so without this they make up most of the daily numbers.
 *
 * Returns a display name for the digest ("Applebot", "Googlebot"), or null for
 * what looks like a real browser. A crawler that sends an ordinary browser
 * user-agent can't be caught here and still counts as a person.
 */

// Most specific first: several Google agents also contain "Googlebot".
const KNOWN: [RegExp, string][] = [
  [/GoogleOther/i, 'GoogleOther'],
  [/Google-InspectionTool/i, 'Google Inspection Tool'],
  [/AdsBot-Google|Mediapartners-Google|Storebot-Google/i, 'Google Ads/Shopping'],
  [/Googlebot/i, 'Googlebot'],
  [/Applebot/i, 'Applebot'],
  [/bingbot|BingPreview|adidxbot/i, 'Bingbot'],
  [/Baiduspider/i, 'Baiduspider'],
  [/YandexBot|YandexRenderResourcesBot/i, 'YandexBot'],
  [/DuckDuckBot/i, 'DuckDuckBot'],
  [/Yahoo! Slurp/i, 'Yahoo Slurp'],
  [/PetalBot/i, 'PetalBot'],
  [/Bytespider/i, 'Bytespider'],
  [/GPTBot|ChatGPT-User|OAI-SearchBot/i, 'OpenAI'],
  [/ClaudeBot|Claude-User|Claude-SearchBot/i, 'Anthropic'],
  [/PerplexityBot|Perplexity-User/i, 'Perplexity'],
  [/CCBot/i, 'Common Crawl'],
  [/Amazonbot/i, 'Amazonbot'],
  [/facebookexternalhit|meta-externalagent/i, 'Meta'],
  [/Twitterbot/i, 'Twitterbot'],
  [/LinkedInBot/i, 'LinkedInBot'],
  [/Slackbot/i, 'Slackbot'],
  [/Discordbot/i, 'Discordbot'],
  [/SemrushBot/i, 'SemrushBot'],
  [/AhrefsBot/i, 'AhrefsBot'],
  [/MJ12bot/i, 'MJ12bot'],
  [/DotBot/i, 'DotBot'],
  [/HeadlessChrome/i, 'Headless Chrome'],
  [/Lighthouse/i, 'Lighthouse'],
];

// Catch-all for agents not listed above: a "bot/1.0"-style token, a bare
// "crawler"/"spider" word, a "+http://..." info link, or an HTTP library.
// Word-bounded so phone models like "CUBOT X30" don't match.
const GENERIC =
  /(?:bot|crawler|spider|scraper)\/|\b(?:bot|crawler|spider|scraper)\b|\+https?:\/\/|\b(?:python-requests|python-urllib|aiohttp|curl|wget|go-http-client|okhttp|axios|node-fetch|undici|phantomjs|puppeteer|playwright|selenium)\b/i;

export function detectBot(userAgent: string | undefined): string | null {
  const ua = (userAgent ?? '').trim();
  if (!ua) return 'No user-agent';
  // Browsers never send a quoted user-agent; scripts that paste one in do.
  if (ua.startsWith('"')) return 'Malformed user-agent';
  for (const [re, name] of KNOWN) if (re.test(ua)) return name;
  if (GENERIC.test(ua)) return 'Other bot';
  return null;
}
