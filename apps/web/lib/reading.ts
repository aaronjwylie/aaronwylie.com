import fs from 'node:fs';
import path from 'node:path';

// Server-only: reads the markdown body to estimate reading time. Imported only
// by Server Components (blog list + article pages).
const WORDS_PER_MINUTE = 200;

/** Estimated reading time in whole minutes (minimum 1) for a blog post. */
export function readingTimeMinutes(slug: string): number {
  try {
    const file = path.join(process.cwd(), 'content', 'blog', `${slug}.md`);
    const text = fs.readFileSync(file, 'utf8');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  } catch {
    return 1;
  }
}
