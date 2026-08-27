# Watchtower

> **Know what’s connected. Know what needs attention. Verify the signal.**

Watchtower is a consent-based privacy exposure intelligence MVP built around the same accountability architecture used across the ecosystem: source traceability, evidence provenance, transparent assessment, visible uncertainty, and user verification.

## Accountability Core

Watchtower does not ask users to trust an opaque risk score or an unsupported claim. It separates verified data, detected indicators, inferred assessments, user-reported information, conflicts, and unknowns. See [ACCOUNTABILITY_CORE.md](ACCOUNTABILITY_CORE.md).

The canonical chain is:

**Question → Authorized Source → Observation → Evidence → Assessment → Unknowns → Verification**

## Privacy boundary

Watchtower is not spyware, stalkerware, or an account-access tool. It does not collect passwords, scrape private accounts, bypass platform security, or claim that a platform exposes profile-viewer information when that platform does not provide it. Live records are only intended to come from an authorized official API, approved OAuth flow, or explicit user input.

Simulated content is held apart from live content at the data-mode and API-query layers. Every simulated record in the application displays the exact disclosure **“DEMO DATA — NOT A LIVE SECURITY FINDING.”** Demo records never populate live-mode results and the live event-creation procedure rejects demo input.

## MVP capabilities

| Area | Included implementation |
| --- | --- |
| Authentication and onboarding | Managed secure sign-in and a consent-focused onboarding flow that explains source and platform limits. |
| Dashboard | Privacy risk, assets, accounts, permissions, tracker intelligence, alerts, recent changes, and separate demo/live modes. |
| Exposure Timeline | Immutable `EXP-XXXXXXXX` event IDs, source/evidence fields, severity, related records, recommended actions, notes, and resolution endpoints. |
| Risk engine | Deterministic 0–100 score with category scores, visible contributions, risk bands, methodology, history tables, and reduction guidance. |
| Privacy controls | Auditable data-export and account-deletion request workflows. |
| Integrations | Official API/OAuth-ready metadata model for scopes, supported data, sync status/errors, and disconnect/revocation capability. |
| Security | Server-side user scoping, input validation, request limiting, audit logs, token-reference architecture, no-password policy, and security documentation. |

## Architecture

The project uses a React and TypeScript client, an Express/tRPC server, MySQL-compatible relational storage through Drizzle, and managed OAuth. The primary model includes users, future organizations, sources, devices, accounts, applications, permissions, trackers, exposure events and evidence, risk assessments/history, alerts, notes, user actions, audit logs, data export requests, account-deletion requests, and integration-token references.

Sensitive provider material is not stored in the relational schema. Future providers should put encrypted secret material in a managed secrets service and persist only a `tokenReference` and `keyVersion` in Watchtower.

## Local development

Run:

```bash
pnpm test
pnpm check
pnpm build
```

## Known MVP limits

The app deliberately ships with a separate static demonstration workspace, not fabricated live findings. Official provider connections, long-running synchronization, production key custody, provider-specific revocation, fulfillment of export/deletion requests, and shared rate-limit storage remain integration-ready workflows requiring provider credentials, deployment-specific operations review, and applicable official API terms.
