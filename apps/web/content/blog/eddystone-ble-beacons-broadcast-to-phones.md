Picture a stadium: 20,000 people, and the venue wants every phone to flash a color on cue, in sync, as part of the show. Now picture the cellular network in that stadium — congested to the point of uselessness. How do you push a signal to thousands of phones when the network is saturated and you can't rely on the internet at all? For APPIX, the answer was Bluetooth Low Energy beacons.

## Beacons broadcast, they don't connect

The mental model most people have of Bluetooth — pair two devices, open a connection — is the wrong one here. BLE beacons work like a lighthouse: they **broadcast** tiny advertising packets into the air, and any nearby phone can *listen* without connecting to anything. One transmitter can reach every phone in range simultaneously. No pairing, no per-device connection, no dependence on WiFi or cellular. That property is what makes crowd-scale, offline broadcast possible.

## Why Eddystone

There are two main beacon formats: Apple's iBeacon and Google's Eddystone. I chose **Eddystone** for one decisive reason: it's an open format that both iOS and Android can receive natively. A single beacon protocol reaching both platforms meant one broadcast system instead of two — the same signal lights up an iPhone and a Pixel alike.

Eddystone has a few frame types. The useful ones for signalling are:

- **Eddystone-UID** — broadcasts a namespace + instance ID. Think of it as "this beacon's identity."
- **Eddystone-URL** — broadcasts a compressed URL.
- **Eddystone-TLM** — telemetry (battery, temperature) about the beacon itself.

By changing the ID a beacon advertises, you change the "message" every listening phone receives — and you can flip that near-instantly across a bank of transmitters.

## The control side

The interesting engineering wasn't only in the phone; it was in the **control station** — software running on dedicated on-site hardware that drove a network of beacons. It decided what each beacon should advertise and when, so that a cue from the show's operator became a coordinated change across the whole venue in real time. Building that meant thinking about timing, reliability under RF interference, and keeping many transmitters in lock-step.

## The receiver side

On the phones, native code did the listening — Objective-C on iOS, Java on Android — scanning for the beacon advertisements and mapping a detected ID to an in-app action: show this image, play this clip, flash this color. Because the phone only has to *receive* an advertisement, it works with the screen doing whatever the experience calls for, and it works when the network is completely underwater.

## The lessons that transfer

BLE beacons are a niche technology, but the ideas behind APPIX generalize:

- **Match the transport to the constraint.** The constraint was "no reliable network in a packed venue," and broadcast RF was the honest answer — not a cleverer use of the network that would still fail.
- **Broadcast beats connections at scale.** Anytime you need one-to-many and connections would explode, look for a broadcast primitive.
- **Cross-platform by design.** Choosing an open format up front saved building and maintaining two parallel systems.

That last point especially: a lot of hard scaling problems get easier when you pick the primitive that's already one-to-many, instead of forcing a one-to-one tool to do a one-to-many job.

*Got an unusual real-time or hardware-adjacent problem? [I enjoy exactly these](/#contact).*
