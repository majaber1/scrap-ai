const { INSTRUCTIONS, parseDataUrl, extractJson, prompt } = require("./schema.cjs");
const { analyzeScrapImage: openaiResponses } = require("../openai.cjs");

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function geminiKey() {
  return process.env.GEMINI_API_KEY || process.env.Scrap_Ai_Gemeni || "";
}

function groqKey() {
  return process.env.GROQ_API_KEY || process.env.groq_scrap_ai || "";
}

function classifyError(status, body) {
  const text = String(body || "");
  if (status === 401 || status === 403) return "auth";
  if (status === 404 || /not found|no longer available|deprecated/i.test(text)) return "model_unavailable";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "provider_5xx";
  if (/timeout|abort/i.test(text)) return "timeout";
  return "provider_error";
}

function geminiModels() {
  return unique([
    process.env.GEMINI_MODEL,
    "gemini-3.6-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash",
  ]);
}

function groqModels() {
  return unique([
    process.env.GROQ_MODEL,
    "qwen/qwen3.6-27b",
    "meta-llama/llama-4-scout-17b-16e-instruct",
  ]);
}

function openaiModels() {
  return unique([process.env.OPENAI_MODEL, "gpt-5.4-mini"]);
}

async function withTimeout(ms, fn) {
  return fn(AbortSignal.timeout(ms));
}

async function geminiAnalyze({ imageDataUrl, context, timeoutMs }) {
  const key = geminiKey();
  if (!key) return { skip: true };
  const parsed = parseDataUrl(imageDataUrl);
  if (!parsed) return { ok: false, errorClass: "invalid_image" };
  let last = { ok: false, errorClass: "provider_error" };
  for (const model of geminiModels()) {
    try {
      const response = await withTimeout(timeoutMs, (signal) => fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: INSTRUCTIONS }] },
            contents: [{
              role: "user",
              parts: [
                { text: prompt(context) },
                { inlineData: { mimeType: parsed.mime, data: parsed.base64 } },
              ],
            }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2200, responseMimeType: "application/json" },
          }),
          signal,
        }
      ));
      const body = await response.text();
      if (!response.ok) {
        last = { ok: false, model, errorClass: classifyError(response.status, body), errorMessage: body.slice(0, 400) };
        console.error("gemini_scrap_error", model, response.status, last.errorMessage);
        continue;
      }
      const payload = JSON.parse(body);
      const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join("\n") || "";
      return {
        ok: true,
        provider: "gemini",
        model: payload.modelVersion || model,
        responseId: payload.responseId || null,
        text,
        usage: payload.usageMetadata || null,
      };
    } catch (error) {
      last = { ok: false, model, errorClass: error.name === "TimeoutError" || error.name === "AbortError" ? "timeout" : "provider_error", errorMessage: error.message };
    }
  }
  return last;
}

async function groqAnalyze({ imageDataUrl, context, timeoutMs }) {
  const key = groqKey();
  if (!key) return { skip: true };
  let last = { ok: false, errorClass: "provider_error" };
  for (const model of groqModels()) {
    try {
      const response = await withTimeout(timeoutMs, (signal) => fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_completion_tokens: 2200,
          messages: [{
            role: "user",
            content: [
              { type: "text", text: `${prompt(context)}\nReturn a single JSON object only. No markdown. Do not include any SAR price.` },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          }],
        }),
        signal,
      }));
      const body = await response.text();
      if (!response.ok) {
        last = { ok: false, model, errorClass: classifyError(response.status, body), errorMessage: body.slice(0, 400) };
        console.error("groq_scrap_error", model, response.status, last.errorMessage);
        continue;
      }
      const payload = JSON.parse(body);
      return {
        ok: true,
        provider: "groq",
        model: payload.model || model,
        responseId: payload.id || null,
        text: payload?.choices?.[0]?.message?.content || "",
        usage: payload.usage || null,
      };
    } catch (error) {
      last = { ok: false, model, errorClass: error.name === "TimeoutError" || error.name === "AbortError" ? "timeout" : "provider_error", errorMessage: error.message };
    }
  }
  return last;
}

async function openaiAnalyze({ imageDataUrl, context, timeoutMs }) {
  if (!process.env.OPENAI_API_KEY) return { skip: true };
  try {
    const result = await Promise.race([
      openaiResponses({ imageDataUrl, context }),
      new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error("timeout"), { name: "TimeoutError" })), timeoutMs)),
    ]);
    if (!result) return { ok: false, errorClass: "provider_error", errorMessage: "openai_empty" };
    return {
      ok: true,
      provider: "openai",
      model: result.model || openaiModels()[0],
      responseId: result.responseId || null,
      json: result.data,
      text: JSON.stringify(result.data),
    };
  } catch (error) {
    return { ok: false, errorClass: error.name === "TimeoutError" ? "timeout" : "provider_error", errorMessage: error.message };
  }
}

async function geminiHealth() {
  return { name: "gemini", configured: Boolean(geminiKey()), models: geminiModels(), capabilities: ["image_analysis", "structured_json"] };
}

async function groqHealth() {
  return { name: "groq", configured: Boolean(groqKey()), models: groqModels(), capabilities: ["image_analysis", "structured_json"] };
}

async function openaiHealth() {
  return { name: "openai", configured: Boolean(process.env.OPENAI_API_KEY), models: openaiModels(), capabilities: ["image_analysis", "structured_json"] };
}

const adapters = {
  gemini: { analyzeImage: geminiAnalyze, healthCheck: geminiHealth },
  groq: { analyzeImage: groqAnalyze, healthCheck: groqHealth },
  openai: { analyzeImage: openaiAnalyze, healthCheck: openaiHealth },
};

function providerOrder() {
  const configured = String(process.env.AI_PROVIDER_ORDER || "gemini,groq,openai")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter((name) => adapters[name]);
  return configured.length ? configured : ["gemini", "groq", "openai"];
}

module.exports = { adapters, providerOrder, extractJson, geminiKey, groqKey };
