'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Google Analytics 4. Rendered from the root layout, so it loads on every page
 * (including all /tools/* pages). The gtag `config` tracks the initial/direct
 * page view; the effect below sends a page_view on client-side route changes so
 * SPA navigations between pages are counted too.
 */
export function Analytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const first = useRef(true);

  // Owner opt-out: honour the same ?notrack flag the internal beacon uses, so
  // this browser is excluded from GA too. Setting ga-disable-<id> before gtag
  // loads (lazyOnload) stops all measurement.
  useEffect(() => {
    try {
      if (localStorage.getItem('pv_notrack') === '1') {
        (window as unknown as Record<string, boolean>)[`ga-disable-${gaId}`] = true;
      }
    } catch {
      /* ignore */
    }
  }, [gaId]);

  useEffect(() => {
    if (first.current) {
      first.current = false; // initial view is handled by gtag('config')
      return;
    }
    try {
      if (localStorage.getItem('pv_notrack') === '1') return; // excluded browser
    } catch {
      /* ignore */
    }
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    w.gtag?.('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="ga4-init" strategy="lazyOnload">
        {`
          try { if (localStorage.getItem('pv_notrack')==='1') window['ga-disable-${gaId}']=true; } catch(e){}
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
