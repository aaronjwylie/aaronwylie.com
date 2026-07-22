// RFC 9116 security.txt. Served at /.well-known/security.txt via a rewrite in
// next.config.js, and directly at /security.txt.
export const dynamic = 'force-static';

const BODY = [
  'Contact: mailto:aaronwyliework@gmail.com',
  'Expires: 2027-07-22T00:00:00.000Z',
  'Preferred-Languages: en',
  'Canonical: https://aaronwylie.com/.well-known/security.txt',
  '',
].join('\n');

export function GET() {
  return new Response(BODY, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
