# Watchtower Trust Charter

## Purpose

Watchtower exists to help a user understand and protect their own digital environment without turning the user's personal information into the product.

This charter is a product requirement. It is intended to govern product behavior, engineering decisions, onboarding, the User Agreement, privacy documentation, and future integrations.

## Our promises

### 1. Deliver the thing the user asked for
Watchtower will prioritize its stated purpose over engagement tricks, attention traps, unnecessary features, and unrelated collection.

### 2. Collect the minimum necessary information
Watchtower will collect only information reasonably necessary for an explicitly described function. If a capability does not require data, Watchtower should not collect that data merely because it is technically obtainable.

### 3. Explain in plain language
Users should be able to understand what Watchtower is doing, what it observed, why it matters, and what choices they have without needing to interpret technical or legal jargon.

### 4. Do not sell the user's personal information
Watchtower will not sell a user's personal information or identifiable Watchtower activity to advertisers or data brokers. Any future business model must be evaluated against this promise before implementation.

### 5. No secret surveillance
Watchtower will not collect passwords, private message contents, private account credentials, or data through bypasses of Android, browser, operating-system, provider, or security controls. The Android agent operates only within permissions and APIs legitimately available to it.

### 6. Evidence has provenance
Watchtower must distinguish among:

- **OBSERVED** — directly reported by an authorized device, API, or other identified source.
- **VERIFIED** — corroborated by an authoritative source or independently confirmed.
- **INFERRED** — an analytical conclusion derived from available evidence.
- **USER-REPORTED** — supplied by the user rather than independently verified.
- **UNKNOWN** — insufficient evidence to make a reliable determination.

Watchtower must never present an inference as an observation or an unverified claim as an established fact.

### 7. No security theater
If a platform does not expose information needed to answer a question, Watchtower will say so. It will not manufacture alarming findings merely to appear more capable or useful.

### 8. User control is a product feature
Users should be able to understand, review, export, and delete their Watchtower data through clearly described mechanisms, subject to legitimate technical, legal, and security requirements disclosed to them.

### 9. Consent must be meaningful
The User Agreement and onboarding should make material collection and use understandable before the user enables the relevant capability. Consent must not depend on dark patterns, misleading labels, or intentionally confusing presentation.

### 10. The code must honor the promise
A promise in the User Agreement is not considered complete merely because it appears in documentation. Where technically enforceable, product and server architecture should make prohibited collection and undisclosed use difficult or impossible.

## Data classification rule

Every Watchtower event should have a source and confidence classification sufficient for the dashboard to explain where the finding came from. Integrations must identify their provider and the permission or authorization basis used to obtain information.

## User Agreement relationship

The User Agreement should contain a concise, readable version of these commitments and link to the complete Trust Charter. The legal agreement may contain necessary legal provisions, but legal language must not contradict or silently expand the product promises stated here.

## Change control

Any feature that materially changes what Watchtower observes, stores, transmits, shares, or sells must trigger a review of this charter, the privacy documentation, onboarding disclosures, data schema, retention behavior, and User Agreement before release.

## Engineering principle

**Promise -> policy -> architecture -> code -> observable behavior.**

Watchtower earns trust by making those layers agree.
