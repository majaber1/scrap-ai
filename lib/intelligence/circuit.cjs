const OPEN_AFTER_MS = Number(process.env.AI_CIRCUIT_OPEN_MS || 60000);
const FAILURE_THRESHOLD = Number(process.env.AI_CIRCUIT_FAILURES || 5);

function store() {
  if (!global.__scrapAiCircuits) global.__scrapAiCircuits = {};
  return global.__scrapAiCircuits;
}

function state(name) {
  const all = store();
  if (!all[name]) all[name] = { failures: 0, openUntil: 0 };
  return all[name];
}

function canAttempt(name) {
  return Date.now() >= state(name).openUntil;
}

function recordSuccess(name) {
  const s = state(name);
  s.failures = 0;
  s.openUntil = 0;
}

function recordFailure(name) {
  const s = state(name);
  s.failures += 1;
  if (s.failures >= FAILURE_THRESHOLD) s.openUntil = Date.now() + OPEN_AFTER_MS;
}

function snapshot() {
  const now = Date.now();
  return Object.fromEntries(
    Object.entries(store()).map(([name, s]) => [name, { failures: s.failures, open: now < s.openUntil }])
  );
}

module.exports = { canAttempt, recordSuccess, recordFailure, snapshot };
