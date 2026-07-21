## The motivation

"It's slow" is the least useful bug report there is - and you never want to be learning your observability tools for the first time during a real incident at 2 a.m. So I built a lab: a realistic, multi-service system where I could deliberately break things and practice finding the cause, until the shape of each failure became familiar.

## What I built

A production-style stack, instrumented end to end:

- **Dockerized Node.js services and PostgreSQL** running on Linux infrastructure.
- Deployed onto a **Kubernetes** cluster, working with real concepts - pods, deployments, services, namespaces, scaling and container lifecycle.
- Instrumented with **Dynatrace OneAgent** across the infrastructure, containers, services and workloads, giving full visibility into metrics, logs and distributed traces.

The point wasn't the tooling for its own sake - it was to have somewhere I could induce realistic production problems and watch the telemetry respond.

## Breaking things on purpose

The most valuable exercises were the failure simulations, because each has a signature you learn to recognize:

- **CPU saturation** - latency climbs while a service pegs a core.
- **Event-loop blocking** - throughput collapses even though CPU looks fine (a Node.js classic).
- **Memory leaks and GC pressure** - the heap grows, GC pauses lengthen, and the process eventually dies with an out-of-memory error.
- **Downstream dependency latency** - the service is fine, but a distributed trace shows the time being spent waiting on a slow database query.

I analyzed PostgreSQL query performance through trace spans, mapped service topology and dependencies, and practiced the incident-style workflow: start from a symptom, pull the traces for the slow requests, find the span eating the time, and correlate with infrastructure metrics and logs.

## What it demonstrates

Observability is a skill, and this lab is deliberate practice at it. It shows I can instrument a distributed system, read metrics/logs/traces together, and go from a vague "it's slow" to a specific root cause - the difference between guessing and knowing. It's also the practical grounding behind the reliability work I bring to client systems.

*I wrote up the lessons in [Observability 101: Lessons from a Dynatrace + Kubernetes Lab](/blog/observability-101-dynatrace-kubernetes-lab).*
