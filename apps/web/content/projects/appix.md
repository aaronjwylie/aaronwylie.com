## The problem

Live events - stadiums, arenas, festivals - are exactly where phones stop working. Twenty thousand people in one place saturate the cellular network, and WiFi rarely covers a venue at that density. Yet that's precisely where you'd most want to do something magical with everyone's phone: a synchronized light show, live stats, exclusive content, a coordinated second screen. The challenge APPIX set out to solve was pushing real-time content to thousands of phones at once, with no reliable network to lean on.

## The approach

The insight was to stop treating the phone as a device you *connect to* and start treating it as a device that *listens*. Instead of thousands of network connections, APPIX broadcasts - using Bluetooth Low Energy beacons that any nearby phone can receive without pairing or a data connection.

I chose Google's **Eddystone** beacon format for one decisive reason: it's open and both iOS and Android can receive it natively, so a single broadcast system reaches every phone in the venue rather than requiring two.

The engineering split into two halves:

- **The control station** - software I wrote in Python, running on dedicated on-site hardware, that drives a network of beacons. An operator's cue becomes a coordinated change across the whole venue in real time, which meant thinking hard about timing, RF interference and keeping many transmitters in lock-step.
- **The phone-side receiver logic** - native code (Objective-C on iOS, Java on Android) that scans for the beacon advertisements and maps a detected signal to an in-app action: show this image, play this clip, flash this colour.

Because the platform is a broadcast system rather than a set of connections, it keeps working when the network is completely underwater - which is the whole point.

## The outcome

APPIX grew from a prototype I built into a distributed platform - spanning mobile apps, cloud infrastructure across DigitalOcean and AWS, and backend services - and has reached over a million people. It has powered live experiences for Disney, UFC, Red Bull, Universal, the Cleveland Cavaliers and the Hollywood Bowl, and has been covered in the tech press.

## What it demonstrates

The core lesson generalizes well beyond beacons: **when you need one-to-many at scale, reach for a primitive that's already one-to-many** instead of forcing a one-to-one tool to do the job. Matching the transport to the real constraint - "no usable network in a packed venue" - was what made the impossible-looking version actually work.

*I wrote more about the beacon tech in [Broadcasting to a Crowd's Phones with Eddystone BLE Beacons](/blog/eddystone-ble-beacons-broadcast-to-phones).*
