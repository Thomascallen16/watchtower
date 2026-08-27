# Accountability Core

Watchtower applies the ecosystem's shared accountability model to privacy and digital exposure information.

## Principles

1. **Source before conclusion.** Identify where an indicator came from.
2. **Separate observation from inference.** A detected signal is not automatically a finding about a person, account, or platform.
3. **Evidence cuts both ways.** Material that reduces or contradicts a risk assessment remains visible.
4. **Unknown is a valid result.** Unsupported claims about platform behavior or exposure must remain unknown.
5. **Provenance matters.** Preserve source, acquisition method, timestamp, and relevant scope where available.
6. **Demo data never becomes live evidence.** Simulations must remain explicitly separated from live-mode records.
7. **Corrections are traceable.** Material changes to an assessment should preserve the reason and source.
8. **No false certainty.** A risk score is a transparent assessment, not proof of wrongdoing, compromise, or intent.
9. **The same standard applies to Watchtower.** Users should be able to inspect why an indicator or score exists.
10. **Consent and authorization are prerequisites.** Live data must come through an authorized official API, approved OAuth flow, or explicit user input.

## Canonical evidence states

- `VERIFIED` — supported by an identified authorized source.
- `DETECTED` — an observable indicator was returned by the authorized source.
- `INFERRED` — an assessment derived from identified indicators and documented rules.
- `USER_REPORTED` — supplied by the user and not independently verified.
- `CONFLICT` — relevant sources disagree.
- `UNKNOWN` — available data cannot establish the proposition.
- `DEMO` — simulated material that is never a live security finding.

## Core chain

**Question → Authorized Source → Observation → Evidence → Assessment → Unknowns → Verification**

Risk scoring must remain deterministic and inspectable: users should be able to see the category contributions and methodology rather than being asked to trust an opaque score.

## Product boundary

Watchtower is privacy/exposure information software. It does not claim to know facts that a provider does not expose, does not bypass security or access controls, and does not turn an indicator into a definitive claim about a person or platform without supporting evidence.
