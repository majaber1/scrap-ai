# Actor Model — Scrap AI V2

## Platform

| Actor | Boundary |
| --- | --- |
| Platform admin | `/admin` — users, orgs, feeds, AI ops, fraud, master data. Not an org admin. |
| System / worker | Jobs, webhooks, ingestion |

## Organization

Configurable roles (seed, not hardcoded in every feature): `ORG_OWNER`, `ORG_ADMIN`, `SELLER`, `BUYER`, `SITE_MANAGER`, `PROCUREMENT`, `FINANCE`, `APPROVER`, `LOGISTICS`, `WEIGHBRIDGE`, `VIEWER`.

Government extras: `REQUESTER`, `REVIEWER`, `AUDITOR`.

External: `Carrier`, `Driver`, `ContainerProvider`, `Inspector` (may be org types or partner orgs).

## Customer UX surfaces

| Surface | Who | Depth |
| --- | --- | --- |
| Individual app | Person | Photo-first, progressive disclosure |
| Company OS | Factory/company members | Operational workspace |
| Government OS | Public entity members | Governance, SoD, audit pack |
| Public market | Anonymous browse | Real open listings only |

V1: every logged-in user is effectively buyer+seller with a starting tab. That continues until Phase 1 RBAC.
