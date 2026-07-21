import { ImageResponse } from 'next/og';
import { getPost, POSTS } from '@/lib/posts';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Article by Aaron Wylie';

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  const title = post?.title ?? 'Aaron Wylie';
  // Shrink the title a touch when it's long so it never overflows the card.
  const titleSize = title.length > 52 ? 50 : 60;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: 'linear-gradient(135deg, #0d1526 0%, #18233d 55%, #0d1526 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -140,
            right: -100,
            width: 440,
            height: 440,
            borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(34,211,238,0.35), rgba(34,211,238,0) 70%)',
            display: 'flex',
          }}
        />
        <div style={{ display: 'flex', color: '#22d3ee', fontSize: 26, fontWeight: 600, letterSpacing: 5 }}>
          AARON WYLIE · WRITING
        </div>
        <div style={{ display: 'flex', color: 'white', fontSize: titleSize, fontWeight: 800, lineHeight: 1.15 }}>
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            height: 8,
            width: 240,
            borderRadius: 9999,
            background: 'linear-gradient(90deg, #22d3ee, #8b5cf6)',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
