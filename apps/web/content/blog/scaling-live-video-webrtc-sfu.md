WebRTC gives you astonishingly low-latency video between two people almost for free. Then you try to make it *one broadcaster, hundreds of viewers* — and it falls apart. Understanding why leads directly to the piece of infrastructure that makes live streaming at scale possible: the SFU.

## Why peer-to-peer doesn't scale

In a plain WebRTC call, every participant sends their media directly to every other participant. That's a **mesh**. For a 1-to-1 call it's perfect. But the broadcaster's upload cost grows with the audience: streaming to 100 viewers means encoding and uploading 100 copies of your video. No home connection — and few servers — can do that. The math simply doesn't work past a handful of peers.

## Three topologies

There are three ways to route the media, and the trade-offs define the design:

- **Mesh** — everyone connects to everyone. Zero server media cost, but upload explodes with participants. Good only for tiny groups.
- **MCU (Multipoint Control Unit)** — a server *decodes* all streams, *mixes* them into one, and sends a single stream out. Cheap for clients, but the server does expensive transcoding for every room. Doesn't scale cheaply.
- **SFU (Selective Forwarding Unit)** — a server *receives* each publisher's stream once and *forwards* copies to subscribers without decoding. This is the sweet spot for live streaming.

## What an SFU actually does

A broadcaster uploads their video to the SFU **one time**. The SFU then forwards that stream to every viewer. The broadcaster's upload is constant no matter how many people watch; the fan-out cost moves to the server, where bandwidth is cheap and horizontal scaling is possible. Because the SFU doesn't decode or re-encode, it stays lightweight and preserves the low latency WebRTC is prized for.

Open-source SFUs like [mediasoup](https://mediasoup.org), Janus, and LiveKit handle the hard WebRTC plumbing — ICE, DTLS, SRTP — and expose an API for creating rooms, producers (publishers), and consumers (subscribers).

## The concepts you'll meet

Working with an SFU, a few terms come up constantly:

- **Producer** — a track (audio or video) a client is publishing to the SFU.
- **Consumer** — a subscription to someone else's producer.
- **Transport** — the DTLS/ICE connection carrying producers or consumers.
- **Simulcast** — the publisher sends several quality layers at once; the SFU forwards the best layer each viewer's connection can handle. This is how you serve a viewer on fiber and one on spotty mobile from the same broadcast.

## Where it gets hard

The SFU solves fan-out, but production live video has more sharp edges:

- **Ingest** from non-WebRTC sources (OBS, RTMP) means bridging protocols into the SFU.
- **Recording** usually means piping the forwarded streams into something like ffmpeg to produce HLS for replay.
- **Reconnection** — mobile networks drop constantly, and rejoining a room cleanly without a black frozen frame takes care.
- **Orientation and codec quirks** across iOS/Android devices will absolutely bite you.

## The takeaway

If you remember one thing: **peer-to-peer WebRTC does not scale to an audience; an SFU is how you get low-latency, one-to-many live video.** Reach for a mesh only for tiny calls, avoid the MCU unless you truly need server-side mixing, and build broadcast on an SFU. It's the architecture behind essentially every live-streaming product you use.

*I build real-time and live-video systems. If that's your problem, [let's talk](/#contact).*
