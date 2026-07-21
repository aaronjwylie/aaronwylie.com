Debugging webhooks is miserable when you can't see them arrive. You configure Stripe or GitHub to POST somewhere, trigger an event, and... nothing, or a 500, and no clue what was actually sent. A request inspector fixes this: you get a unique URL, point the webhook at it, and watch requests land in your browser in real time. Here's how to build one with Fastify and WebSockets.

## The shape of the tool

Three moving parts:

1. A **capture endpoint** that accepts any HTTP method at a unique URL and records what it received.
2. A **WebSocket** that pushes each captured request to the browser the instant it arrives.
3. An ephemeral, in-memory **store** of "bins" (one per URL), so nothing has to touch a database.

## Capturing any request

The key trick is accepting arbitrary bodies. By default Fastify parses JSON and rejects unknown content types — but a webhook might send form data, XML, or a raw payload. Inside the plugin, replace the parsers so every body is read as a raw string:

    fastify.removeAllContentTypeParsers();
    fastify.addContentTypeParser('*', { parseAs: 'string' }, (_req, body, done) => done(null, body));

Then register a catch-all route for every method:

    const methods = ['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'];
    app.route({ method: methods, url: '/h/:id', handler: capture });
    app.route({ method: methods, url: '/h/:id/*', handler: capture });

The handler snapshots the method, headers, query, body, and IP, stores it in the bin, and broadcasts it.

## Streaming with WebSockets

`@fastify/websocket` adds a `websocket: true` flag to routes. When a browser connects, send it the existing requests, then keep the socket to push new ones:

    fastify.get('/hooks/:id/ws', { websocket: true }, (socket, req) => {
      const bin = getBin(req.params.id);
      socket.send(JSON.stringify({ type: 'snapshot', requests: bin.requests }));
      bin.sockets.add(socket);
      socket.on('close', () => bin.sockets.delete(socket));
    });

When a request is captured, fan it out to every connected socket:

    for (const s of bin.sockets) {
      if (s.readyState === 1) s.send(JSON.stringify({ type: 'request', request }));
    }

## The nginx detail everyone hits

WebSockets need an HTTP upgrade, and nginx won't perform it unless you tell it to. On the proxied location:

    location /api/ {
        proxy_pass http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 3600s;
    }

Without the `Upgrade`/`Connection` headers, the browser's `wss://` connection silently fails and you'll swear the code is broken. The long `proxy_read_timeout` keeps idle sockets from being cut.

## Keep it bounded

Because bins live in memory, put guards on them: cap the number of requests per bin, cap the total number of bins, and expire bins after a couple of hours with a cleanup interval. A public tool without these becomes a memory leak with a URL.

## Why WebSockets and not polling

You *could* poll a REST endpoint every few seconds, and it'd mostly work. But the whole value of a request inspector is *immediacy* — you trigger an event and see it the same instant. That's what real-time transport is for, and it's a good reminder that WebSockets aren't just for chat apps.

*Need real-time features done right? [I'd love to help](/#contact).*
