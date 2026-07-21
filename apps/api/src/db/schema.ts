import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

/**
 * Projects shown on the portfolio. The website renders this straight from the
 * API, so the API - not a hardcoded array in the frontend - is the source of truth.
 */
export const projects = pgTable(
  'projects',
  {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 96 }).notNull().unique(),
    title: varchar('title', { length: 160 }).notNull(),
    tagline: varchar('tagline', { length: 240 }).notNull(),
    description: text('description').notNull(),
    // e.g. ["TypeScript", "Node.js", "Postgres"]
    techStack: jsonb('tech_stack').$type<string[]>().notNull().default([]),
    role: varchar('role', { length: 120 }),
    // Freeform link map: { github, live, appStore, playStore, press: [...] }
    links: jsonb('links').$type<Record<string, unknown>>().notNull().default({}),
    // Higher = shown first. The flagship (APPIX) gets the highest.
    featured: boolean('featured').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    featuredIdx: index('projects_featured_idx').on(t.featured, t.sortOrder),
  }),
);

/**
 * Contact form submissions. Persisted so nothing is lost even before email is wired.
 */
export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  email: varchar('email', { length: 254 }).notNull(),
  message: text('message').notNull(),
  // Light abuse forensics without storing anything sensitive.
  userAgent: varchar('user_agent', { length: 512 }),
  handled: boolean('handled').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * One row per page view - powers the live "visitor stats" widget that
 * demonstrates the site is backed by a real, queryable database.
 */
export const pageViews = pgTable(
  'page_views',
  {
    id: serial('id').primaryKey(),
    path: varchar('path', { length: 512 }).notNull(),
    // Coarse day bucket (YYYY-MM-DD) for cheap grouping.
    day: varchar('day', { length: 10 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    dayIdx: index('page_views_day_idx').on(t.day),
    pathIdx: index('page_views_path_idx').on(t.path),
  }),
);

/**
 * Uptime monitors — a URL the status-page tool watches. Seeded "permanent"
 * monitors track my own infra; visitor-added ones are ephemeral (expiresAt).
 */
export const monitors = pgTable(
  'monitors',
  {
    id: serial('id').primaryKey(),
    url: text('url').notNull().unique(),
    host: varchar('host', { length: 255 }).notNull(),
    permanent: boolean('permanent').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // null for permanent monitors; a timestamp for ephemeral visitor-added ones.
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (t) => ({ expiresIdx: index('monitors_expires_idx').on(t.expiresAt) }),
);

/** One row per uptime check (time-series). */
export const monitorChecks = pgTable(
  'monitor_checks',
  {
    id: serial('id').primaryKey(),
    monitorId: integer('monitor_id')
      .notNull()
      .references(() => monitors.id, { onDelete: 'cascade' }),
    checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow(),
    ok: boolean('ok').notNull(),
    statusCode: integer('status_code'),
    responseMs: integer('response_ms'),
  },
  (t) => ({ mIdx: index('monitor_checks_monitor_idx').on(t.monitorId, t.checkedAt) }),
);

export type Monitor = typeof monitors.$inferSelect;
export type MonitorCheck = typeof monitorChecks.$inferSelect;

/** Short links + per-click analytics (URL shortener tool). */
export const shortLinks = pgTable('short_links', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 16 }).notNull().unique(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const linkClicks = pgTable(
  'link_clicks',
  {
    id: serial('id').primaryKey(),
    linkId: integer('link_id')
      .notNull()
      .references(() => shortLinks.id, { onDelete: 'cascade' }),
    at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
    day: varchar('day', { length: 10 }).notNull(),
    referrer: varchar('referrer', { length: 512 }),
  },
  (t) => ({ linkIdx: index('link_clicks_link_idx').on(t.linkId) }),
);

export type ShortLink = typeof shortLinks.$inferSelect;

/** One-time secrets — server stores only ciphertext; deleted on first read. */
export const secrets = pgTable(
  'secrets',
  {
    id: varchar('id', { length: 32 }).primaryKey(),
    ciphertext: text('ciphertext').notNull(),
    iv: varchar('iv', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (t) => ({ expiresIdx: index('secrets_expires_idx').on(t.expiresAt) }),
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
