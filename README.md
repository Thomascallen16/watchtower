# Watchtower

> **Know what’s connected. Know what needs attention.**

Watchtower is a consent-based privacy exposure intelligence MVP. It provides a consumer-friendly dashboard, a source-aware Digital Exposure Timeline, and a transparent rules-based risk score. The product is intentionally designed to distinguish verified data, detected indicators, inferred assessments, user-reported information, and items that require investigation.

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

Run the following commands in the project directory.

```bash
pnpm test
pnpm check
pnpm build
```

The managed project supplies its own authentication, database, and platform configuration. Configure any future third-party integration key using the project’s secret-management interface rather than committing `.env` files. The initially reserved optional integration values are `HIBP_API_KEY`, `TRACKER_INTELLIGENCE_API_KEY`, and `TOKEN_REFERENCE_KEY_VERSION`; no integration is treated as live until its official authorization flow and credentials are properly configured.

## API surface

Watchtower uses typed RPC procedures under `/api/trpc`. See [API.md](./API.md) for the currently implemented contracts. See [SECURITY.md](./SECURITY.md) for the security model and deployment conditions.

## Known MVP limits

The app deliberately ships with a separate static demonstration workspace, not fabricated live findings. Official provider connections, long-running synchronization, production key custody, provider-specific revocation, fulfillment of export/deletion requests, and shared rate-limit storage remain integration-ready workflows that require provider credentials, a deployment-specific operations review, and the relevant official API terms.
