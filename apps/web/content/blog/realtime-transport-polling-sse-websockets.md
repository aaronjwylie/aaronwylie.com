Two of the tools on this site push updates to the browser: the webhook inspector, which shows requests as they land, and the collaboration room, with its live cursors. Both needed a transport, and "use WebSockets" turned out to be the wrong reflex for one of them.

Here is how I actually decide now.

## The three options

**Polling.** The client asks on a timer. Dead simple, works through every proxy ever built, survives a server restart without any reconnection logic. Costs you a request per interval per client, and updates arrive up to one interval late.

**Server-Sent Events.** One long-lived HTTP response the server writes into. Unidirectional - server to client only - but it is plain HTTP, the browser reconnects automatically, and `EventSource` is about four lines of client code.

**WebSockets.** A full duplex upgrade. Genuinely bidirectional, lowest per-message overhead, and the most operational surface: connection state, heartbeats, reconnection with backoff, and a protocol upgrade that some corporate proxies still mangle.

## The question that decides it

Not "how real-time does this feel" - almost everything feels real-time under a second. The question is **who initiates**.

If only the server has news, you do not need a socket. A webhook inspector is exactly this: requests arrive at the server, the browser only listens. SSE fits perfectly, and so does polling.

If both ends send constantly - cursors, presence, collaborative editing - the per-message overhead and the round-trip of an HTTP POST per event start to matter, and WebSockets earn their complexity.

## Where I landed

The webhook inspector polls every two seconds. That sounds unfashionable. In practice a webhook arrives seconds to minutes after you configure it, nobody perceives a two-second delay, and the whole implementation is a `setInterval` and a query. There is no connection to drop, nothing to reconnect, and no special nginx configuration.

The collaboration room is the interesting case. Cursors move continuously, so this is the textbook WebSocket use case. I still used polling, for one reason: it runs inside a Next.js App Router deployment, and route handlers there have no WebSocket support. Adding a socket would have meant a second process alongside the app, plus nginx upgrade rules, plus its own deployment and monitoring.

For a free demo tool, that is a poor trade. Cursor updates are throttled to 100ms on the way out and the client polls at 700ms, which reads as live to the eye. If this were a product where collaboration was the core feature, the answer flips - the complexity would be worth it, and I would run a dedicated socket service.

## If you do reach for SSE

A few things bite:

- Disable proxy buffering, or nginx will hold your events until the buffer fills. `proxy_buffering off;` on that location.
- Send a comment line as a keepalive every 20-30 seconds. Idle connections get reaped by intermediaries.
- Set `X-Accel-Buffering: no` for good measure.
- Remember browsers cap concurrent HTTP/1.1 connections per origin. Over HTTP/2 this stops mattering, which is another reason to make sure HTTP/2 is on.

## The general shape

Start with polling. Move to SSE when the interval starts to feel long or the request volume starts to show up in your metrics. Move to WebSockets when the client genuinely needs to push as often as the server does.

Most "real-time" features never get past the first step, and the ones that stop there are the ones nobody gets paged about.
