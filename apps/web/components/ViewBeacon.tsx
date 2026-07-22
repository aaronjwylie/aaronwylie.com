'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { apiUrl } from '@/lib/api';

/**
 * Fire-and-forget page-view beacon. Records each visit in the API so the "live
 * visitor stats" on the homepage reflect real traffic. Failures are ignored -
 * analytics must never break the page.
 *
 * Owner opt-out: visit any page with ?notrack=1 to stop this browser from being
 * counted (durable, stored in localStorage); ?notrack=0 re-enables it.
 */
export function ViewBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      const notrack = new URLSearchParams(window.location.search).get('notrack');
      if (notrack === '1') localStorage.setItem('pv_notrack', '1');
      else if (notrack === '0') localStorage.removeItem('pv_notrack');
      if (localStorage.getItem('pv_notrack') === '1') return; // excluded browser
    } catch {
      /* localStorage unavailable - fall through and count normally */
    }
    fetch(`${apiUrl}/stats/view`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}
