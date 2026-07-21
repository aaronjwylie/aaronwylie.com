import type { SVGProps } from 'react';

/** Shared line-icon set (24px grid, stroke = currentColor). */
function Svg({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

// Concentric broadcast waves — APPIX (BLE beacons to phones).
export const BroadcastIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="1.75" fill="currentColor" stroke="none" />
    <path d="M8.1 8.1a5.5 5.5 0 0 0 0 7.8M15.9 8.1a5.5 5.5 0 0 1 0 7.8" />
    <path d="M5.2 5.2a9.5 9.5 0 0 0 0 13.6M18.8 5.2a9.5 9.5 0 0 1 0 13.6" />
  </Svg>
);

// Stacked server / API.
export const ServerIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="7" rx="1.5" />
    <rect x="3" y="13" width="18" height="7" rx="1.5" />
    <path d="M7 7.5h.01M7 16.5h.01" />
  </Svg>
);

// Play / video stream.
export const VideoIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M10 9.2 15 12l-5 2.8z" fill="currentColor" stroke="none" />
  </Svg>
);

// Pulse / activity — observability.
export const ActivityIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12h3.5l2-6 3.5 12 2.5-7 1.5 3H21" />
  </Svg>
);

// Envelope — contact.
export const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </Svg>
);

// Terminal — tools.
export const TerminalIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m7 9 3 3-3 3M13 15h4" />
  </Svg>
);

// Layered stack — projects.
export const LayersIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
  </Svg>
);

// Star — flagship.
export const StarIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.6 6.8 19.2l1-5.8L3.5 9.2l5.9-.9L12 3Z" />
  </Svg>
);

// Lightning — real-time / webhooks.
export const ZapIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </Svg>
);

// Person — about.
export const UserIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Svg>
);

// Briefcase — services / experience.
export const BriefcaseIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
  </Svg>
);

// Angle brackets — technologies / code.
export const CodeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5.5l-3 13" />
  </Svg>
);

// Lock — one-time secret.
export const LockIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="10" width="15" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Svg>
);

// Globe — DNS lookup.
export const GlobeIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
  </Svg>
);

// QR grid — QR generator.
export const QrIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="4" width="6" height="6" rx="1" />
    <rect x="14" y="4" width="6" height="6" rx="1" />
    <rect x="4" y="14" width="6" height="6" rx="1" />
    <path d="M14 14h3v3M20 14v6M17 20h3" />
  </Svg>
);

// Chain link — URL shortener.
export const LinkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.5 13.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5l-1 1" />
    <path d="M14.5 10.5a3.5 3.5 0 0 0-5 0L7 13a3.5 3.5 0 0 0 5 5l1-1" />
  </Svg>
);

// Shield — security / password.
export const ShieldIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 5 6v5c0 4.4 3 7.8 7 9 4-1.2 7-4.6 7-9V6l-7-3Z" />
    <path d="m9.2 12 2 2 3.6-3.8" />
  </Svg>
);
