import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { faker } from '@faker-js/faker';

const CLASSIC_SENTENCE =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
const CLASSIC_WORDS =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'.split(
    ' ',
  );

// Query params arrive as strings; coerce "true"/"1" to a real boolean.
const booleanish = z.preprocess(
  (v) => (typeof v === 'string' ? v === 'true' || v === '1' : v),
  z.boolean(),
);

const MAX: Record<string, number> = {
  paragraphs: 50,
  sentences: 200,
  words: 1000,
  characters: 50_000,
  lists: 100,
};

export async function loremRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/lorem',
    {
      config: { rateLimit: { max: 120, timeWindow: '1 minute' } },
      schema: {
        tags: ['tools'],
        summary: 'Generate lorem ipsum placeholder text',
        description:
          'Generate placeholder text by paragraphs, sentences, words, characters or list items, ' +
          'as plain text or HTML, optionally starting with the classic "Lorem ipsum…" opener.',
        querystring: z.object({
          unit: z.enum(['paragraphs', 'sentences', 'words', 'characters', 'lists']).default('paragraphs'),
          count: z.coerce.number().int().min(1).max(50_000).default(5),
          startWithLorem: booleanish.default(true),
          format: z.enum(['text', 'html']).default('text'),
        }),
        response: {
          200: z.object({
            text: z.string(),
            stats: z.object({ characters: z.number(), words: z.number(), paragraphs: z.number() }),
          }),
        },
      },
    },
    async (request) => {
      const { unit, format } = request.query;
      const startWithLorem = request.query.startWithLorem;
      const count = Math.min(request.query.count, MAX[unit] ?? 50);

      let blocks: string[] = [];

      switch (unit) {
        case 'paragraphs': {
          for (let i = 0; i < count; i++) blocks.push(faker.lorem.paragraph());
          if (startWithLorem && blocks[0]) blocks[0] = `${CLASSIC_SENTENCE} ${blocks[0]}`;
          break;
        }
        case 'sentences': {
          if (startWithLorem) {
            const rest = count > 1 ? ` ${faker.lorem.sentences(count - 1)}` : '';
            blocks = [`${CLASSIC_SENTENCE}${rest}`];
          } else {
            blocks = [faker.lorem.sentences(count)];
          }
          break;
        }
        case 'words': {
          let words: string[];
          if (startWithLorem) {
            words = [...CLASSIC_WORDS];
            while (words.length < count) words.push(faker.lorem.word());
          } else {
            words = faker.lorem.words(count).split(' ');
          }
          let text = words.slice(0, count).join(' ');
          text = `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
          blocks = [text];
          break;
        }
        case 'characters': {
          let base = startWithLorem ? `${CLASSIC_SENTENCE} ` : '';
          while (base.length < count) base += `${faker.lorem.paragraph()} `;
          blocks = [base.slice(0, count).trimEnd()];
          break;
        }
        case 'lists': {
          for (let i = 0; i < count; i++) blocks.push(faker.lorem.sentence());
          if (startWithLorem && blocks[0]) blocks[0] = CLASSIC_SENTENCE;
          break;
        }
      }

      let text: string;
      if (unit === 'lists') {
        text =
          format === 'html'
            ? `<ul>\n${blocks.map((i) => `  <li>${i}</li>`).join('\n')}\n</ul>`
            : blocks.map((i) => `• ${i}`).join('\n');
      } else if (format === 'html') {
        text = blocks.map((p) => `<p>${p}</p>`).join('\n');
      } else {
        text = blocks.join('\n\n');
      }

      const plain = blocks.join('\n');
      return {
        text,
        stats: {
          characters: plain.length,
          words: plain.trim().split(/\s+/).filter(Boolean).length,
          paragraphs: blocks.length,
        },
      };
    },
  );
}
