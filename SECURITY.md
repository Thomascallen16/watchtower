# Watchtower Security Model

Watchtower is designed as a consent-based privacy intelligence product. It must not be used for credential collection, covert monitoring, unauthorized account access, private-data scraping, or claims that an unsupported platform reveals profile viewers.

## Data boundaries

The application maintains separate `live` and `demo` modes at the data-model and API-query layers. Demo records are never returned by live-mode queries. The interface must display the exact disclosure **“DEMO DATA — NOT A LIVE SECURITY FINDING.”** on every simulated record and in its containing context.

No user password, OAuth access token, refresh token, or other raw credential is stored in the relational model. The integration model stores only a token reference and key version for a future managed-secret implementation. Provider-specific authorization and revocation must occur solely through documented, user-authorized flows.

## Controls included in this MVP

| Control | Implementation |
| --- | --- |
| Authentication | Managed OAuth session with server-side protected procedures. |
| Authorization | Every private query scopes records by authenticated user ID and data mode. |
| Input validation | Typed Zod schemas validate API inputs before persistence. |
| Rate limiting | Per-user, per-procedure in-memory request limit for the MVP. Replace with a shared store before multi-instance production use. |
| Audit logging | Security-sensitive record, privacy, and integration actions create audit-log entries. |
| Data minimization | Models retain only necessary metadata, source details, references, and user-provided notes. |
| Privacy rights | Typed export and account-deletion request workflows are available. |

## Deployment requirements

Before connecting a provider, configure its secrets outside source control, validate environment variables at startup, apply least-privilege OAuth scopes, set approved redirect URIs, and perform a provider-specific security review. Deploy only over HTTPS, retain database backups securely, and replace the MVP in-memory limiter with shared infrastructure for horizontally scaled production.
