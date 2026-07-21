Any time your server fetches a URL that a user supplied, you've opened the door to Server-Side Request Forgery (SSRF). It's one of the most under-appreciated vulnerabilities in web apps, and it's easy to introduce by accident: a URL preview generator, a webhook tester, an "import from URL" feature. Here's how the attack works and how to shut it down in Node.

## The attack

Your server runs inside a network the attacker can't reach directly — a private VPC, a Kubernetes cluster, a cloud VM. When you fetch a user-supplied URL *from that server*, the attacker borrows your server's network position. They point your fetcher at:

- `http://169.254.169.254/` — the cloud metadata endpoint, which can leak credentials.
- `http://localhost:6379/` — an internal Redis or admin service.
- `http://10.0.0.5/` — another box on your private network.

Your firewall never sees an external attacker. It sees your own trusted server making the request.

## The core defense: resolve, then check

Blocking hostnames like `localhost` isn't enough — `127.0.0.1`, `0177.0.0.1`, and a domain whose DNS record *points* at `10.0.0.5` all reach internal targets. The reliable approach is to resolve the hostname to IP addresses and reject any that are private or reserved:

    import dns from 'node:dns/promises';
    import net from 'node:net';

    async function assertSafeUrl(raw: string) {
      const u = new URL(raw);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('bad scheme');

      const addrs = net.isIP(u.hostname)
        ? [{ address: u.hostname }]
        : await dns.lookup(u.hostname, { all: true });

      for (const { address } of addrs) {
        if (isPrivate(address)) throw new Error('refusing private address');
      }
      return u;
    }

`isPrivate` should reject the full set of non-public ranges: loopback (`127.0.0.0/8`, `::1`), link-local (`169.254.0.0/16` — this covers the metadata endpoint), private ranges (`10/8`, `172.16/12`, `192.168/16`), unique-local IPv6 (`fc00::/7`), and IPv4-mapped IPv6 addresses.

## Re-check every redirect

Here's the subtlety that catches people: a public URL can respond with a `302` redirect to an internal one. If you follow redirects automatically, your validation on the *first* URL is worthless. Follow redirects manually and validate each hop:

    let current = (await assertSafeUrl(input)).toString();
    for (let i = 0; i <= 5; i++) {
      await assertSafeUrl(current);            // re-check every hop
      const res = await fetch(current, { redirect: 'manual' });
      const loc = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && loc) {
        current = new URL(loc, current).toString();
        continue;
      }
      return res;
    }

## Belt and suspenders

Also: always set a timeout (`AbortSignal.timeout(8000)`), cap the response size, and rate-limit the endpoint. And if you can, run the fetcher with no access to internal networks at all — defense in depth means not relying solely on the IP check.

## Why bother

I use exactly this guard in a public "endpoint inspector" tool that makes outbound requests on user input. It's the difference between a helpful utility and an open proxy into my infrastructure. If any part of your app fetches user-controlled URLs, this check belongs there today.

*Want a second set of eyes on your app's security? [Get in touch](/#contact).*
