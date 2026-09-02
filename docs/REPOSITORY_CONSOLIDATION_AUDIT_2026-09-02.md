# Repository Consolidation Audit — 2026-09-02

## Target state

The accountability ecosystem is being reduced to two canonical products:

1. **The Citizen's Record** — the public civic portal and canonical public application.
2. **Open the Record** — the private record/evidence workspace.

**Watchtower remains a security/intelligence instrument**, not a third top-level civic product. Its supply-chain intelligence is an operational subsystem that can protect both canonical products.

## Connected repositories audited

| Repository | Current role | Target disposition |
| --- | --- | --- |
| `The-Citizens-Record` | Public civic portal | Canonical Citizen's Record |
| `citizens-record` | Full-stack accountability foundation | Merge unique production code into Citizen's Record; archive duplicate |
| `The-Citizen-Main-File` | Legacy static/source material | Preserve unique archive material; archive |
| `Open-the-Record` | Record workspace | Canonical Open the Record |
| `ProofFlow` | Evidence/provenance instrument | Merge unique pipeline into Open the Record; archive |
| `watchtower` | Security/exposure intelligence | Retain as security instrument |
| `docs` | Supporting documentation | Move canonical docs into the two products; archive |
| `fear-the-wolves` | Separate application/experiment | Keep outside the accountability products or archive independently |

## Important audit limitation

This audit uses the connected GitHub repository inventory and repository/code-search evidence available to Watchtower. It is **not** a claim that every byte of every repository has been executed, dependency-installed, fuzzed, or penetration-tested. No issue observed is not equivalent to proven secure.

## Findings

### Watchtower

The supply-chain analyzer and evidence-native architecture were present, but there was no user-visible supply-chain console. This branch adds an authenticated tRPC procedure and UI page at `/app/supply-chain`, with repository disposition and evidence fields.

### citizens-record / The-Citizens-Record

The repositories represent overlapping layers of the same product family. Keeping both as canonical application repositories creates avoidable duplication and increases the chance of divergent fixes. Unique code should be reconciled before archival.

### ProofFlow

ProofFlow is documented as an evidence/provenance instrument. It should become a subsystem of Open the Record rather than remain a separate top-level product.

### The-Citizen-Main-File / docs

Both are supporting/legacy repositories. Their unique source and documentation should be preserved before archival.

### fear-the-wolves

This repository is not part of the two-product accountability architecture. It should not be mixed into either canonical product without a deliberate product decision.

## Consolidation safety rules

- Do not delete a repository before its unique content is migrated and verified.
- Preserve commit history where practical; otherwise preserve an archive snapshot and provenance note.
- Do not silently overwrite the working Citizen's Record or Open the Record with a duplicate repository.
- Treat dependency findings, architecture findings, and consolidation recommendations as separate evidence classes.
- Human approval is required before destructive repository operations or production remediation.
