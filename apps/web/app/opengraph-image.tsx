import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Aaron Wylie - Full-Stack Developer in Vancouver, Canada';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Branded social-share card, generated on the server (no external image assets).
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '90px',
          background: 'linear-gradient(135deg, #0d1526 0%, #18233d 55%, #0d1526 100%)',
          position: 'relative',
        }}
      >
        {/* glow accents */}
        <div
          style={{
            position: 'absolute',
            top: -140,
            right: -100,
            width: 440,
            height: 440,
            borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(34,211,238,0.40), rgba(34,211,238,0) 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -170,
            left: -110,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(139,92,246,0.35), rgba(139,92,246,0) 70%)',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', color: '#22d3ee', fontSize: 26, fontWeight: 600, letterSpacing: 6 }}>
          FRONT END · BACK END · FULL-STACK DEVELOPER
        </div>
        <div style={{ display: 'flex', color: 'white', fontSize: 96, fontWeight: 800, marginTop: 24, letterSpacing: -2 }}>
          Aaron Wylie
        </div>
        <div style={{ display: 'flex', color: '#94a3b8', fontSize: 38, marginTop: 22 }}>
          Vancouver, Canada · Builder of APPIX
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 46,
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
