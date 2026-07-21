'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { apiUrl } from '@/lib/api';

/**
 * Fire-and-forget page-view beacon. Records each visit in the API so the "live
 * visitor stats" on the homepage reflect real traffic. Failures are ignored -
 * analytics must never break the page.
 */
export function ViewBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    fetch(`${apiUrl}/stats/view`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}
