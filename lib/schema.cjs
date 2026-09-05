const { readFileSync } = require("fs");
const { join } = require("path");

const files = [
  ["001_core.sql", "001_core"],
  ["002_operations.sql", "002_operations"],
  ["003_ai_intelligence.sql", "003_ai_intelligence"],
  ["004_phase1_foundation.sql", "004_phase1_foundation"],
  ["005_phase1_column_repair.sql", "005_phase1_column_repair"],
];

function statementsFrom(sql) {
  const withoutComments = sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
  const statements = [];
  let current = "";
  let inDollar = false;
  for (let i = 0; i < withoutComments.length; i++) {
    const ch = withoutComments[i];
    const next = withoutComments[i + 1];
    if (ch === "$" && next === "$") {
      inDollar = !inDollar;
      current += "$$";
      i += 1;
      continue;
    }
    if (ch === ";" && !inDollar) {
      const stmt = current.trim();
      if (stmt) statements.push(stmt);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

function loadMigration(file) {
  const dir = join(__dirname, "..", "db", "migrations");
  return statementsFrom(readFileSync(join(dir, file), "utf8"));
}

async function ensureSchema(pool) {
  if (global.__scrapSchemaReady) return;
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [87421001]);
    if (global.__scrapSchemaReady) return;
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    for (const [file, id] of files) {
      for (const sql of loadMigration(file)) {
        try {
          await client.query(sql.endsWith(";") ? sql : `${sql};`);
        } catch (error) {
          if (error.code !== "42710") throw error;
        }
      }
      await client.query("INSERT INTO schema_migrations(id) VALUES($1) ON CONFLICT DO NOTHING", [id]);
    }
    global.__scrapSchemaReady = true;
  } finally {
    try {
      await client.query("SELECT pg_advisory_unlock($1)", [87421001]);
    } catch {
      /* ignore unlock races */
    }
    client.release();
  }
}

const ensureOperations = ensureSchema;

module.exports = { ensureSchema, ensureOperations };
