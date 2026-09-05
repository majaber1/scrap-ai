# System Architecture — Scrap AI V2

**Baseline:** ADR-001. Modular monolith on Vercel + PostgreSQL until Phase 10 extraction.

---

## Current runtime (Phase 0 host + Phase 1 `/v2` shell)

```
Web (V1 static root) + /v2 TypeScript shell
  → BFF: api/*.js including api/v2/* (Node serverless)
    → identity, marketplace, platform, AI, upload, health, org/sites/RBAC
    → PostgreSQL
    → Object storage (Blob / R2)
    → AI provider adapters
```

Target (same deploy unit):

```
WEB / future PWA / future mobile
  → Application/API layer
    → identity | org | materials | market | price | AI | logistics | container | weight | payment | admin
    → PostgreSQL
    → Object storage
    → AI providers
    → Price feeds (when licensed)
    → Domain events / outbox → workers
```

---

## Module write rules

A context may **read** published views of another context. It may **not** write another context’s tables except through that context’s API/services.

Architecture tests grep/enforce:

- Client JS contains no provider API keys.  
- Marketplace handlers do not call payment provider SDKs.  
- AI engine does not UPDATE `scrap_transactions` settlement fields.  
- Settlement math is not in `lib/ai*`.  
- Tenant lists must filter `organization_id` (Phase 1+).

---

## Phase 0 technical decisions

| Decision | Choice |
| --- | --- |
| Monolith vs services | Modular monolith |
| AI interface | `AIProvider.analyzeImage / generateStructured / healthCheck` |
| Providers | Config-driven Gemini, Groq, OpenAI adapters |
| Validation | Zod + repair pass |
| Resilience | timeout, retry, circuit breaker (process), fallback chain |
| Schema apply | `pg_advisory_lock` on a single client |
| Jobs | Interactive analyze remains request-scoped in Phase 0; queue in Phase 1 |
| Frontend rewrite | **Not** in Phase 0 |

---

## Environments

- Production: `https://scrap-ai.vercel.app`  
- Secrets: Vercel env (aliases exist for misspelled dashboard names; prefer `GEMINI_API_KEY` / `GROQ_API_KEY`)  
- Health: `GET /api/health`

---

## Observability (Phase 0 minimum)

Table `ai_provider_events`: provider, model, latency_ms, ok, error_class, fallback, tokens if present.  
Health reports configured provider/model, not “fake success”.
