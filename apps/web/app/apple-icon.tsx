import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Apple touch icon (home-screen): "A" on the brand gradient.
export default function AppleIcon() {
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
          fontSize: 120,
          fontWeight: 800,
        }}
      >
        A
      </div>
    ),
    { ...size },
  );
}
