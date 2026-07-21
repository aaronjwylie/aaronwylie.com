"It's slow" is the least actionable bug report there is. Slow where? The database? A downstream API? Garbage collection? Without visibility into a running system, you're guessing. Observability is the discipline of making a system explain itself — and the best way I've found to learn it is to build a lab where you *cause* problems on purpose and practice finding them.

## Monitoring vs. observability

They're related but not the same. **Monitoring** answers questions you already knew to ask: "is CPU above 80%?", "is the error rate up?" — dashboards and alerts on known metrics. **Observability** is the property of being able to ask *new* questions of a system without shipping new code — "why is *this specific* request slow?" It rests on three pillars:

- **Metrics** — numeric time series (request rate, latency, memory).
- **Logs** — timestamped events, ideally structured.
- **Traces** — the path of a single request as it hops across services, with timing at each step.

Traces are the pillar people underuse, and they're the one that turns "it's slow" into "it's slow *because of this query*."

## The lab

I built a hands-on lab to practice: a Dockerized Node.js and PostgreSQL stack on Linux, deployed onto a Kubernetes cluster, instrumented with Dynatrace's OneAgent across the infrastructure, containers, services, and workloads. The point wasn't the tooling for its own sake — it was to have a realistic, multi-service system where I could break things and watch the telemetry respond.

## Breaking things on purpose

The most valuable exercises were the failure simulations, because each one has a *signature* you learn to recognize:

- **CPU saturation** — latency climbs across the board while a service pegs a core. The trace shows time spent *in* the service, not waiting on dependencies.
- **Event-loop blocking** (a Node classic) — throughput collapses even though CPU looks fine, because one synchronous operation is holding the loop hostage.
- **Memory leaks and GC pressure** — heap grows steadily, GC pauses lengthen, and eventually the process is killed with an out-of-memory error. The metric graph tells the story before the crash does.
- **Downstream latency** — your service is fine, but a distributed trace shows the time is being spent waiting on a slow database query or an external call.

That last one is the payoff of tracing: it points at the *span* that's actually slow, so you stop blaming the wrong layer.

## Finding the root cause

The workflow that emerged looked the same each time: start from a symptom (elevated latency), pull the distributed traces for the slow requests, find the span consuming the time, and correlate it with infrastructure metrics and logs from that container. Service topology and dependency maps made "what talks to what" obvious, so a problem in one service didn't send me hunting through five others.

Analyzing PostgreSQL query performance through trace spans was especially clarifying — a slow endpoint stops being mysterious when you can see it's a single un-indexed query eating 400 ms.

## Why practice this

You don't want to be learning your observability tools *during* an incident, at 2 a.m., with users watching. Building a lab where you deliberately induce CPU saturation, leaks, and downstream stalls means that when a real system misbehaves, the graph shape is already familiar and your instinct goes straight to the right pillar. Observability is a skill, and like any skill it rewards deliberate practice.

*Want help instrumenting your system so it explains itself? [Get in touch](/#contact).*
