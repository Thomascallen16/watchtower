# Watchtower Supply-Chain Intelligence

Watchtower now treats software supply-chain risk as an evidence-correlation problem, not a CVE-counting problem.

## Objective

For each dependency, Watchtower should preserve and correlate:

1. **Inventory** — package name, version, ecosystem, manifest, lockfile, and direct/transitive status.
2. **Vulnerability authority** — vulnerability identifiers, affected ranges, fixed versions, severity, and authoritative source links.
3. **Code reachability** — whether vulnerable functions are present and whether application paths can reach them.
4. **Input reachability** — whether attacker-controlled input can reach the vulnerable functionality.
5. **Runtime behavior** — package execution, install scripts, network destinations, file changes, and permission signals.
6. **Assessment** — a separately labeled conclusion about exploitability and confidence.
7. **Unknowns** — facts that have not been established and must not be silently inferred.

## Evidence model

The analyzer in `server/supplyChain.ts` is deterministic. It does not turn the existence of a CVE into an exploitability claim.

The resulting assessment distinguishes:

- `not_established` — no exploitability evidence has been established.
- `possible` — a vulnerability is known, but reachability is not established.
- `likely` — vulnerable functionality is reachable, but attacker-controlled input is not established.
- `established` — vulnerable functionality and attacker-controlled input are both established by the supplied evidence.

Confidence is independently reported as `low`, `medium`, or `high`.

## Architecture

```text
Dependency inventory
        |
        +---- Vulnerability authority
        |
        +---- Code/function reachability
        |
        +---- Attacker-input reachability
        |
        +---- Sandboxed runtime observations
        |
        v
 Evidence correlation
        |
        +---- FACT / detected evidence
        +---- INFERENCE / assessment
        +---- UNKNOWN / missing evidence
        |
        v
 Human review packet
        |
        v
 Bounded remediation proposal
        |
        v
 Human approval before consequential action
```

## Safety boundary

The system may analyze repositories, dependencies, and sandbox observations, but it must not execute untrusted package code on the host environment merely to investigate it. Runtime inspection should use an isolated sandbox with explicit network and filesystem controls.

AI agents may explain evidence, compare findings, and propose bounded remediation. They must not silently convert model reasoning into a verified security fact, and consequential external changes remain subject to the Watchtower approval boundary.

## Roadmap

- Parse npm/Python/Cargo/Go/Maven/NuGet manifests and lockfiles.
- Normalize vulnerability feeds into the evidence model.
- Add dependency graph and function-level reachability adapters.
- Add sandbox telemetry for install scripts and package runtime behavior.
- Add SBOM generation and VEX-style status records.
- Add an agent gateway that receives the deterministic evidence bundle and returns separately labeled inference.
- Surface supply-chain findings in the Watchtower timeline and risk explanation UI.
- Generate remediation branches/PRs only after the evidence bundle passes policy checks and require human approval for consequential deployment changes.
