import { QuoteIcon } from './icons';

// Real, on-the-record feedback about APPIX from the industry. Verbatim from the
// APPIX go-to-market materials; ordered strongest-first. These praise the APPIX
// experience/product Aaron built - presented as project feedback, not as
// generic "client" reviews.
interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'APPIX technology made the concert more visually exciting and surprising for me and my band mates on stage as well! Congratulations are due to APPIX on this utterly unique technology and for inventing a whole new way to connect artists with their fans.',
    name: 'Donnie Wahlberg',
    role: 'Founding member, New Kids on the Block',
  },
  {
    quote:
      'APPIX added a truly unique and engaging element for Disney Concerts Coco Live-to-Film at The Hollywood Bowl which really brought the audience into the show as active participants. We look forward to future opportunities to collaborate with them again.',
    name: 'Chip McLean',
    role: 'SVP/GM, Disney Concerts Worldwide',
  },
  {
    quote:
      "People's phones lit up with crazy and amazing light patterns that looked INSANE! Audience members were an active part of the lighting design of the venue and the musical number... Incredible!",
    name: 'Jaime Camil',
    role: 'Actor & Golden Globe Nominee',
  },
  {
    quote:
      "APPIX has the most frictionless public health & safety notification, emergency message alerts solution I've ever seen!",
    name: 'Jim Digby',
    role: 'Co-Founder, Event Safety Alliance',
  },
  {
    quote:
      'My mind is blown and a sincere job well done on the tech. I look forward to connecting the dots with APPIX and each of you. Most likely you guys will cost me some sleep - in a good, mind-bending way that is.',
    name: 'Greg Jones',
    role: 'VP, Harman Group North America',
  },
];

const SITE_URL = 'https://aaronwylie.com';

export function Testimonials() {
  // Review structured data attached to APPIX (a CreativeWork) - no aggregate
  // rating, so nothing self-serving for Google to flag.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: 'APPIX',
    url: `${SITE_URL}/projects/appix`,
    review: TESTIMONIALS.map((t) => ({
      '@type': 'Review',
      reviewBody: t.quote,
      author: { '@type': 'Person', name: t.name },
    })),
  };

  return (
    <section className="container-page py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="section-label mb-4 flex items-center gap-2">
        <QuoteIcon className="h-4 w-4" /> What people said about APPIX
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={t.name}
            className={`card flex flex-col ${
              // Let the two strongest quotes breathe across the full width on md+.
              i < 1 ? 'md:col-span-2' : ''
            }`}
          >
            <QuoteIcon className="mb-3 h-7 w-7 text-accent/40" />
            <blockquote className="flex-1 text-lg leading-relaxed text-slate-200">
              {t.quote}
            </blockquote>
            <figcaption className="mt-4 border-t border-white/10 pt-4">
              <span className="font-semibold text-white">{t.name}</span>
              <span className="mt-0.5 block text-sm text-slate-400">{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
