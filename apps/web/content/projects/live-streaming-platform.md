*This is an in-progress project, described at the architecture level.*

## The problem

Real-time live video is deceptively hard the moment you go past a one-to-one call. WebRTC makes peer-to-peer video almost free, but a single broadcaster streaming to a real audience breaks that model completely - the broadcaster can't upload a separate copy of their video to every viewer. On top of that, the product needed live video to feel *discoverable*: streams placed on an interactive map, appearing and disappearing in real time as broadcasters go live.

## The approach

The heart of the system is a **WebRTC SFU** (Selective Forwarding Unit). A broadcaster uploads their stream to the server once; the SFU forwards copies to every viewer without decoding or re-encoding. That keeps the broadcaster's upload constant no matter how many people watch, moves the fan-out cost to the server where bandwidth is cheap, and preserves the low latency WebRTC is prized for.

Around that core sits the rest of the platform:

- **Server-side recording and HLS pipelines** for replay of streams after they end.
- **A geo-spatial, map-based discovery system** that places live streams on an interactive map in real time over WebSockets - so the map stays live as broadcasters come and go.
- **Native iOS and Android apps (React Native) and a web client**, plus a web-based **administration portal** for operations, moderation and configuration.
- **RTMP ingest** so external broadcasters (OBS, hardware encoders) can publish alongside in-app streams.

It's TypeScript across a Node.js API, backed by Postgres, with the media handled by containerized SFU workers.

## Where the hard problems live

Most of the difficulty in production live video isn't the happy path - it's the edges:

- **Connection resilience** - mobile networks drop constantly, and rejoining a stream cleanly without a frozen black frame takes real care.
- **Video orientation and codec correctness** across the huge range of iOS and Android devices.
- **Keeping discovery and viewer fan-out performant** as concurrency grows.

## What it demonstrates

This project is where several of my strengths meet: real-time media, distributed systems, mobile and web clients, and the operational side of running media infrastructure. It's the clearest example of taking a genuinely hard systems problem and shipping it across every surface a real product needs.

*I wrote about the core architecture in [Scaling Live Video: An Intro to WebRTC SFUs](/blog/scaling-live-video-webrtc-sfu).*
