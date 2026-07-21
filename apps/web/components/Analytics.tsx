'use client';

import Script from 'next/script';

/**
 * Google Analytics 4. Rendered only when NEXT_PUBLIC_GA_ID is set, so the site
 * ships zero tracking until a Measurement ID is configured. Loads after the page
 * is interactive so it never blocks rendering.
 */
export function Analytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
