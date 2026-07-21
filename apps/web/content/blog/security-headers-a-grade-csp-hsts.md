I built a tool that grades any URL's security headers, then pointed it at my own site. It scored an F. That was a good, humbling reminder: shipping HTTPS is not the same as being secure. A handful of response headers close some of the most common browser-side attack vectors, and adding them takes about ten minutes.

## The headers that matter

Six headers do most of the work. Here's what each one buys you.

- **Strict-Transport-Security (HSTS)** — tells browsers to only ever reach you over HTTPS, defeating downgrade and cookie-stealing attacks. `max-age=31536000; includeSubDomains`.
- **Content-Security-Policy (CSP)** — the big one. Controls where scripts, styles, images, and frames may load from. Your main defense against cross-site scripting (XSS).
- **X-Content-Type-Options: nosniff** — stops the browser from "guessing" a response's type and, say, executing an image as a script.
- **X-Frame-Options: SAMEORIGIN** — prevents your pages being embedded in a hostile iframe (clickjacking).
- **Referrer-Policy: strict-origin-when-cross-origin** — stops leaking full URLs (which may contain tokens) to third parties.
- **Permissions-Policy** — switches off browser features you don't use, like `camera=(), microphone=(), geolocation=()`.

## Adding them at the edge

If you terminate TLS at nginx, the cleanest place to set these is the proxy — every response gets them, regardless of the app behind it:

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

The `always` keyword matters — without it, nginx skips the header on error responses like 404s.

## CSP without breaking everything

CSP is where people give up, because a strict policy tends to break the very site it's protecting. Start permissive-but-real and tighten from there:

    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src https://player.vimeo.com; connect-src 'self'; object-src 'none'; base-uri 'self'" always;

A few notes from experience:

- `'unsafe-inline'` on `script-src` is a compromise many frameworks (including Next.js) need for their hydration scripts unless you set up nonces. It weakens CSP, but the header is still worth having.
- Every third-party you embed needs an entry. Video from Vimeo? Add `frame-src https://player.vimeo.com`. Analytics? Allow its script and connect hosts.
- After deploying, **open the browser console.** CSP violations are logged there, and each one tells you exactly which directive to adjust.

## Verify, don't assume

Once it's live, check the actual response headers — `curl -I https://yoursite.com` — or run it through a header-grading tool. My site went from F to A with the block above, and I confirmed nothing broke: pages rendered, embedded videos still played, and forms still posted.

## The takeaway

Security headers are the highest security-per-minute change you can make. They don't replace real work like input validation and auth, but they're free, they're fast, and their absence is the first thing a sharp reviewer will notice.

*Need a security review of your app's headers and setup? [Reach out](/#contact).*
