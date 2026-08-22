# Project Recovery Status — Watchtower

> **Scope:** Watchtower is a consent-based privacy exposure intelligence MVP. It is not spyware, stalkerware, an account-access tool, or a way to identify everyone who viewed a person’s phone, profile, or private activity.

| Field | Verified status |
|---|---|
| **PROJECT** | Watchtower |
| **STATUS** | IN PROGRESS |
| **GITHUB REPOSITORY** | https://github.com/Thomascallen16/watchtower |
| **BRANCH** | `main` |
| **AUDIT BASE COMMIT** | `f4951079503e43c2e693155ef394e6eda676b909` — “chore: confirm final checkpoint readiness” |
| **LATEST COMMIT** | Recovery-document preservation commit; verify with `git log -1 --format=%H` after synchronization. |
| **DEPLOYMENT** | GitHub deployment and Pages status could not be inspected with the connected authorization; no live deployment is claimed. |
| **LIVE URL** | Not verified. |

## Working Features

- Consent-focused authenticated dashboard, digital exposure timeline, demo/live separation, immutable exposure IDs, source/evidence fields, resolution workflows, and privacy-request workflows.
- Deterministic and explainable 0–100 risk scoring with category contributions and history.
- Official API/OAuth-ready integration model, input validation, owner scoping, rate limiting, audit logging, and token-reference architecture.
- Automated verification completed on the audit baseline: `pnpm check`, `pnpm test`, and `pnpm build` all exited successfully.

## Incomplete Features

- Official provider integrations, OAuth connection flows, provider-specific revocation, long-running synchronization, and production operations remain integration-ready rather than verified live capabilities.
- Export/deletion-request fulfillment requires a deployment-specific operations process.
- One open GitHub issue, titled `files`, was present at audit time and should be reviewed before declaring the repository fully closed.

## Blocked By

- Provider credentials, OAuth application approvals, official API terms, and deployment-specific secret management.
- Platform APIs do not generally disclose private viewers or permit access to private-account activity; Watchtower must not claim otherwise.
- GitHub API authorization did not permit this audit to verify private-repository deployment metadata.

## Exact Action Required From Tommy

1. Decide which supported official providers to integrate first and create the approved OAuth/API applications.
2. Add only the required provider secrets through the managed secret interface, then verify the consent, sync, disconnect, and revocation flows with non-sensitive test accounts.
3. Review and resolve the open `files` issue.
4. Confirm the managed deployment URL and complete a logged-in privacy export/deletion-request smoke test.

## Environment Variables Required

The managed runtime supplies `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_URL`, and `BUILT_IN_FORGE_API_KEY`. Optional reserved integration variables are `HIBP_API_KEY`, `TRACKER_INTELLIGENCE_API_KEY`, and `TOKEN_REFERENCE_KEY_VERSION`. Store actual values only in the managed secret configuration; never commit them.

## Next Command or Task

```bash
pnpm check && pnpm test && pnpm build
```

Then complete an approved official-provider connection flow with a test account and document the supported data, scopes, sync limits, revocation behavior, and any provider restrictions.

## Audit Evidence

- Audit executed against a fresh clone at the base commit listed above.
- Dependency installation using the lockfile succeeded.
- All three documented verification commands passed locally on 2026-08-22.
- No uncommitted source changes were present before this recovery document was added.
