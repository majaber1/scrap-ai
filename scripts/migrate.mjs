import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required for npm run migrate");
  process.exit(1);
}

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");
const files = ["001_core.sql", "002_operations.sql"];
const client = new pg.Client({ connectionString: url.replace("sslmode=require", "sslmode=verify-full") });
await client.connect();
try {
  for (const file of files) {
    const sql = await readFile(join(dir, file), "utf8");
    await client.query(sql);
    console.log(`applied ${file}`);
  }
} finally {
  await client.end();
}
