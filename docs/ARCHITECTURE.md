# Scrap AI Architecture

Last verified against current `main` and production health: **2026-08-26**.

## Runtime shape

Browser → static HTML/CSS/JavaScript client → Vercel serverless `/api/*` functions → PostgreSQL / OpenAI / Cloudflare R2 depending on the operation.

The repository is no longer accurately described as browser-local only. The UI remains lightweight and static-first, while durable operations are implemented through serverless APIs.

## Serverless API boundaries

- `api/auth.js` — account/session operations
- `api/health.js` — safe dependency readiness
- `api/ai-analyze.js` — optional OpenAI-assisted scrap analysis
- `api/platform.js` — durable platform/business data operations
- `api/upload.js` — Cloudflare R2 object upload path
- `api/workflow.js` — transaction/workflow progression

Shared server behavior lives in `lib/server.cjs`, including PostgreSQL pooling, password hashing, signed sessions and API helpers.

## Persistence

### PostgreSQL

`DATABASE_URL` configures durable relational data. Production health must be used to determine whether the database is reachable now; documentation alone is not evidence of runtime availability.

### Session security

`SESSION_SECRET` must be at least 32 characters for authenticated production behavior. Session cookies are HttpOnly, Secure and SameSite=Lax.

### Cloudflare R2

`api/upload.js` uses Cloudflare R2 through its S3-compatible endpoint. Required server-side environment variables:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`

As of the 2026-08-26 production verification, the code path is implemented but `/api/health` reports storage as **not configured**. This means the missing piece is production environment configuration, not application support.

## AI boundary

`api/ai-analyze.js` uses `OPENAI_API_KEY` and optional `OPENAI_MODEL`. AI results are indicative only and cannot replace inspection, certified grading, weighing, purity testing, ownership checks or current buyer quotations.

As of the 2026-08-26 production verification, health reports AI as not configured.

## Health contract

`GET /api/health` is the operational source of truth for:

- overall status
- database readiness
- session readiness
- AI readiness/model
- storage readiness/provider

The endpoint must never expose connection strings, access keys, session secrets or provider tokens.

## Source-of-truth policy

1. **Code truth:** current GitHub `main`.
2. **Runtime truth:** live `/api/health` plus actual journey tests.
3. **Architecture truth:** this document, updated whenever runtime boundaries change.
4. **Historical QA:** useful evidence only for the date recorded in each report.
5. **Portfolio status:** Jaber Dashboard must synchronize from the repository manifest and live health instead of copying claims manually.
