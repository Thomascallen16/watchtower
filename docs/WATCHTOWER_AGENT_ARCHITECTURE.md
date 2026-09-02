# Watchtower Evidence-Native Agent Kernel

This document turns the Strataigize-style operator pattern into a Watchtower architecture without coupling the system to a single model provider.

## Design principles

1. Deterministic software handles deterministic work; models are used only where judgment is required.
2. Every agent has a declared identity, task, authority level, and auditable event trail.
3. Tool access is a mechanical policy boundary, not a prompt instruction.
4. Source provenance is first-class. Unsupported statements cannot silently become FACT.
5. Consequential external actions require human approval.
6. Prohibited actions remain prohibited even for a fully privileged agent.
7. Agents propose and execute bounded work; deployment and irreversible changes remain controlled.

## Authority ladder

- **0 Observe:** read/retrieve/inspect.
- **1 Analyze:** compare/classify/detect/analyze.
- **2 Prepare:** draft requests, reports, records, and proposed findings.
- **3 Execute reversible:** bounded internal changes and reversible operations.
- **4 Execute consequential:** eligible only through explicit human approval.
- **5 Reserved:** no new autonomous capability; prohibited operations remain denied by policy.

## Initial agent fleet

- `watchtower-core`: orchestration and policy routing.
- `evidence-intake`: ingestion, hashing, extraction, provenance.
- `researcher`: source discovery and retrieval.
- `classifier`: FACT/Law/Claim/Inference/Contradiction/Question/Unknown classification.
- `contradiction`: compare sourced statements and surface conflicts.
- `review`: prepare human approval packets.

## First production workflow

`document -> hash -> extract -> classify -> link source -> detect conflicts -> human review -> evidence record -> audit event`

The first success gate should measure extraction accuracy, provenance retention, unauthorized side effects (target: zero), and explicit handling of unknowns. Do not expand the autonomous surface until the bounded workflow passes its evaluation set.

## Future infrastructure

The kernel can later add a model gateway, MCP tool gateway, scheduler/event queue, PostgreSQL evidence store, object storage, hybrid search, and evidence graph. These are intentionally not coupled into this first kernel so the security boundary can be tested independently.
