# AI Architecture

**Interface**

```
AIProvider
  analyzeImage({ image, mime, context }) → { text, raw, model, usage }
  generateStructured({ prompt, schema, images? })
  healthCheck() → { ok, model }
```

**Registries (config, not hardcoded retired IDs)**

- Provider order: `AI_PROVIDER_ORDER` or default `gemini,groq,openai`
- Models: `GEMINI_MODEL`, `GROQ_MODEL`, `OPENAI_MODEL` plus built-in **fallback model lists**
- Capabilities: `image_analysis`, `structured_json`, `ocr` (ocr unused in Phase 0)

**Pipeline:** VALIDATE → (store later) → PRIMARY → FALLBACK → ZOD → REPAIR → DB → UI  

**Rules:** Visual estimate only. `physicalConfirmationRequired=true`. No SAR market price from the LLM. Settlement never in this module.

**Resilience:** timeout (default 25s), retry 429/5xx once, circuit open after 5 failures / 60s, fallback next provider.

**Telemetry:** `ai_provider_events`.
