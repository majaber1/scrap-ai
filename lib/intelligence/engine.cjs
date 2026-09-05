const { extractJson, validateAnalysis } = require("./schema.cjs");
const { adapters, providerOrder } = require("./providers.cjs");
const circuit = require("./circuit.cjs");

const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 25000);
const RETRIES = Number(process.env.AI_RETRIES || 1);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function usageTokens(usage) {
  if (!usage || typeof usage !== "object") return { prompt: null, completion: null };
  return {
    prompt: usage.promptTokenCount || usage.prompt_tokens || null,
    completion: usage.candidatesTokenCount || usage.completion_tokens || usage.totalTokenCount || null,
  };
}

async function runAdapter(name, input) {
  const adapter = adapters[name];
  if (!adapter) return { skip: true };
  if (!circuit.canAttempt(name)) {
    return { ok: false, errorClass: "circuit_open", errorMessage: "circuit_open", skippedCircuit: true };
  }
  let last = { ok: false, errorClass: "provider_error" };
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    const started = Date.now();
    const result = await adapter.analyzeImage({ ...input, timeoutMs: TIMEOUT_MS });
    result.latencyMs = Date.now() - started;
    result.provider = result.provider || name;
    if (result.skip) return result;
    if (result.ok) {
      circuit.recordSuccess(name);
      return result;
    }
    last = result;
    const retryable = result.errorClass === "rate_limit" || result.errorClass === "provider_5xx" || result.errorClass === "timeout";
    if (!retryable || attempt === RETRIES) break;
    await sleep(400 * (attempt + 1));
  }
  if (!last.skippedCircuit) circuit.recordFailure(name);
  return last;
}

async function analyzeScrapImage(input) {
  const events = [];
  const names = providerOrder();
  let fallbackUsed = false;
  let firstTried = false;
  for (const name of names) {
    const result = await runAdapter(name, input);
    if (result.skip) continue;
    const tokens = usageTokens(result.usage);
    const json = result.json || extractJson(result.text);
    const data = result.ok ? validateAnalysis(json) : null;
    events.push({
      provider: name,
      model: result.model || null,
      status: data ? "completed" : result.ok ? "invalid_schema" : "failed",
      ok: Boolean(data),
      latencyMs: result.latencyMs || null,
      errorClass: data ? null : result.errorClass || (result.ok ? "invalid_schema" : "provider_error"),
      errorMessage: result.errorMessage || null,
      promptTokens: tokens.prompt,
      completionTokens: tokens.completion,
    });
    if (data) {
      return {
        data,
        provider: result.provider || name,
        model: result.model,
        responseId: result.responseId || null,
        fallbackUsed,
        latencyMs: result.latencyMs,
        events,
      };
    }
    if (result.ok && json) {
      const repaired = validateAnalysis({ ...json, estimateKind: "VISUAL_ESTIMATE", labCertifiedPurity: false });
      events[events.length - 1].status = repaired ? "repaired" : events[events.length - 1].status;
      events[events.length - 1].ok = Boolean(repaired);
      if (repaired) {
        return {
          data: repaired,
          provider: result.provider || name,
          model: result.model,
          responseId: result.responseId || null,
          fallbackUsed,
          latencyMs: result.latencyMs,
          events,
        };
      }
    }
    if (firstTried) fallbackUsed = true;
    firstTried = true;
  }
  return { data: null, fallbackUsed, events };
}

async function aiStatus() {
  const names = providerOrder();
  const providers = [];
  for (const name of names) {
    providers.push(await adapters[name].healthCheck());
  }
  const ready = providers.filter((p) => p.configured);
  const primary = ready[0] || providers[0];
  return {
    configured: ready.length > 0,
    gemini: Boolean(ready.find((p) => p.name === "gemini")),
    groq: Boolean(ready.find((p) => p.name === "groq")),
    openai: Boolean(ready.find((p) => p.name === "openai")),
    provider: primary?.configured ? primary.name : "none",
    model: primary?.configured ? primary.models[0] : null,
    providers,
    circuits: circuit.snapshot(),
    required: ready.length ? [] : ["GEMINI_API_KEY", "GROQ_API_KEY"],
  };
}

module.exports = { analyzeScrapImage, aiStatus };
