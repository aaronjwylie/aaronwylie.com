// Small helpers for AES-GCM secret sharing. All client-side (Web Crypto).

export function bufToB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  let t = s.replace(/-/g, '+').replace(/_/g, '/');
  while (t.length % 4) t += '=';
  const bin = atob(t);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Encrypt a string; returns base64url ciphertext, iv and raw key. */
export async function encryptSecret(plain: string): Promise<{
  ciphertext: string;
  iv: string;
  key: string;
}> {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plain),
  );
  const rawKey = await crypto.subtle.exportKey('raw', key);
  return {
    ciphertext: bufToB64url(ct),
    iv: bufToB64url(iv.buffer),
    key: bufToB64url(rawKey),
  };
}

/** Decrypt with a base64url key/iv/ciphertext. */
export async function decryptSecret(
  ciphertext: string,
  iv: string,
  keyB64: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    b64urlToBytes(keyB64),
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  );
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64urlToBytes(iv) },
    key,
    b64urlToBytes(ciphertext),
  );
  return new TextDecoder().decode(pt);
}
