# Watchtower API Overview

Watchtower exposes typed RPC procedures under `/api/trpc`. All Watchtower procedures require an authenticated user, validate input at the boundary, and scope data by the session user ID.

| Area | Procedure | Purpose |
| --- | --- | --- |
| Dashboard | `watchtower.dashboard` | Returns authorized records only for the requested live or demo mode, plus an explainable risk assessment. |
| Exposure events | `watchtower.events.list`, `get`, `create`, `updateResolution`, `addNote` | Supports immutable EXP IDs, evidence, safe user notes, and resolution workflows. |
| Risk | `watchtower.risk.explain` | Calculates the transparent rules-based risk score and can record score history. |
| Integrations | `watchtower.integrations.list`, `register` | Exposes integration metadata without accepting passwords or raw tokens. |
| Privacy | `watchtower.privacy.requestExport`, `requestDeletion` | Records data export and account-deletion requests. |

Demo content is intentionally isolated from live content. When a caller requests demo mode, consumer UI must show the exact required disclosure on every simulated record.
