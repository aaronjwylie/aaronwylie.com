import { Faker, en } from '@faker-js/faker';

/**
 * The catalog of field types a user can choose for a mock resource. Each maps
 * to a deterministic generator. The whole dataset for a mock is derived from a
 * per-resource seed, so nothing is persisted - the same mock always returns the
 * same data, generated on demand.
 */
export const FIELD_TYPES = {
  id: { label: 'ID (sequential)', gen: (_f: Faker, i: number) => i + 1 },
  uuid: { label: 'UUID', gen: (f: Faker) => f.string.uuid() },
  firstName: { label: 'First name', gen: (f: Faker) => f.person.firstName() },
  lastName: { label: 'Last name', gen: (f: Faker) => f.person.lastName() },
  fullName: { label: 'Full name', gen: (f: Faker) => f.person.fullName() },
  email: { label: 'Email', gen: (f: Faker) => f.internet.email() },
  username: { label: 'Username', gen: (f: Faker) => f.internet.username() },
  phone: { label: 'Phone', gen: (f: Faker) => f.phone.number() },
  avatar: { label: 'Avatar URL', gen: (f: Faker) => f.image.avatar() },
  boolean: { label: 'Boolean', gen: (f: Faker) => f.datatype.boolean() },
  number: { label: 'Number (1-1000)', gen: (f: Faker) => f.number.int({ min: 1, max: 1000 }) },
  price: { label: 'Price', gen: (f: Faker) => Number(f.commerce.price({ min: 5, max: 500 })) },
  date: { label: 'Date (YYYY-MM-DD)', gen: (f: Faker) => f.date.past().toISOString().slice(0, 10) },
  datetime: { label: 'Datetime (ISO)', gen: (f: Faker) => f.date.recent().toISOString() },
  word: { label: 'Word', gen: (f: Faker) => f.lorem.word() },
  sentence: { label: 'Sentence', gen: (f: Faker) => f.lorem.sentence() },
  paragraph: { label: 'Paragraph', gen: (f: Faker) => f.lorem.paragraph() },
  city: { label: 'City', gen: (f: Faker) => f.location.city() },
  country: { label: 'Country', gen: (f: Faker) => f.location.country() },
  streetAddress: { label: 'Street address', gen: (f: Faker) => f.location.streetAddress() },
  zipCode: { label: 'Zip / postal code', gen: (f: Faker) => f.location.zipCode() },
  company: { label: 'Company', gen: (f: Faker) => f.company.name() },
  jobTitle: { label: 'Job title', gen: (f: Faker) => f.person.jobTitle() },
  productName: { label: 'Product name', gen: (f: Faker) => f.commerce.productName() },
  color: { label: 'Colour', gen: (f: Faker) => f.color.human() },
  url: { label: 'URL', gen: (f: Faker) => f.internet.url() },
  imageUrl: { label: 'Image URL', gen: (f: Faker) => f.image.url() },
} as const;

export type FieldType = keyof typeof FIELD_TYPES;
export const FIELD_TYPE_KEYS = Object.keys(FIELD_TYPES) as FieldType[];

/** Public catalog (key + human label) for the builder UI. */
export const FIELD_CATALOG = FIELD_TYPE_KEYS.map((key) => ({ key, label: FIELD_TYPES[key].label }));

export interface MockField {
  name: string;
  type: FieldType;
}
export interface MockResource {
  name: string;
  count: number;
  fields: MockField[];
}
export interface MockConfig {
  resources: MockResource[];
}

/** Stable 32-bit seed from a string (FNV-1a). */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Small LRU-ish cache so repeat requests don't regenerate. Keyed by mock+resource.
const cache = new Map<string, Record<string, unknown>[]>();
const CACHE_MAX = 200;

/**
 * Deterministically generate a resource's full dataset. Same (mockId, resource)
 * always yields identical rows. Every row is guaranteed an `id` for addressing.
 */
export function generateRecords(mockId: string, resource: MockResource): Record<string, unknown>[] {
  const key = `${mockId}:${resource.name}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const faker = new Faker({ locale: [en] });
  faker.seed(hashSeed(key));

  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < resource.count; i++) {
    const row: Record<string, unknown> = {};
    for (const field of resource.fields) {
      const spec = FIELD_TYPES[field.type] ?? FIELD_TYPES.word;
      row[field.name] = spec.gen(faker, i);
    }
    if (row.id === undefined) row.id = i + 1; // always addressable
    rows.push(row);
  }

  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, rows);
  return rows;
}

export function clearMockCache(mockId: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(`${mockId}:`)) cache.delete(key);
  }
}
