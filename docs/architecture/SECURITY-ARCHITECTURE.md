# Security Architecture

Mandatory: server-side authz, signed sessions, CSRF where applicable, secure cookies, rate limits, validation, upload MIME/size, private object URLs, secrets in env, no keys in browser, webhook signatures, idempotency, transaction boundaries, tenant isolation tests, OWASP baseline.

Phase 0: session on AI, hourly cap, image allowlist, HMAC cookies already present. RBAC and tenant tests land Phase 1.
