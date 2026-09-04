const { readFileSync } = require("fs");
const { join } = require("path");

const files = ["001_core.sql", "002_operations.sql"];

function statementsFrom(sql) {
  const withoutComments = sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
  return withoutComments
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

function loadStatements() {
  const dir = join(__dirname, "..", "db", "migrations");
  return files.flatMap((file) => statementsFrom(readFileSync(join(dir, file), "utf8")));
}

async function ensureSchema(pool) {
  if (global.__scrapSchemaReady) return;
  for (const sql of loadStatements()) {
    await pool.query(sql.endsWith(";") ? sql : `${sql};`);
  }
  global.__scrapSchemaReady = true;
}

const ensureOperations = ensureSchema;

module.exports = { ensureSchema, ensureOperations };
