'use client';

import { useEffect, useState } from 'react';

/** Shows a countdown, then navigates to the destination. */
export function AutoRedirect({ url, seconds = 5 }: { url: string; seconds?: number }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) {
      window.location.href = url;
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, url]);
  return <span>{left}</span>;
}
