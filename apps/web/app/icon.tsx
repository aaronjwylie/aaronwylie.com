import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

// Favicon: a bold "A" on the site's cyan→violet gradient.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #22d3ee 0%, #8b5cf6 100%)',
          color: 'white',
          fontSize: 46,
          fontWeight: 800,
          borderRadius: 14,
        }}
      >
        A
      </div>
    ),
    { ...size },
  );
}
