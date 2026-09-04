const { Pool } = require("pg");
const { ensureSchema } = require("../lib/schema.cjs");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL.replace("sslmode=require", "sslmode=verify-full"),
    max: 1,
  });
  try {
    await ensureSchema(pool);
    console.log("Scrap AI schema ready.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
