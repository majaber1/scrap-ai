const { readFileSync, existsSync } = require("fs");
const { Pool } = require("pg");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.validation.tmp");
loadEnvFile(".env.local");
loadEnvFile(".env");

function expect(value, message) {
  if (!value) throw new Error(message);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required for schema gate");
    process.exit(1);
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL.replace("sslmode=require", "sslmode=verify-full"),
    max: 1,
  });
  const tables = ["ai_listing_drafts", "material_mapping_events", "ai_feedback_events"];
  const existing = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema='public' AND table_name = ANY($1)
     ORDER BY table_name`,
    [tables]
  );
  const found = existing.rows.map((row) => row.table_name);
  for (const name of tables) expect(found.includes(name), `missing table ${name}`);

  const extraCatalogs = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema='public'
       AND table_name ~ '^(ai_)?materials?(_catalog|_types?)?$'
       AND table_name NOT IN ('materials','material_families','material_grades','material_aliases')
     ORDER BY 1`
  );

  const fks = await pool.query(
    `SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table, rc.delete_rule
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
     JOIN information_schema.referential_constraints rc
       ON rc.constraint_name = tc.constraint_name
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND tc.table_name = ANY($1)
     ORDER BY tc.table_name, kcu.column_name`,
    [tables]
  );

  const indexes = await pool.query(
    `SELECT tablename, indexname
     FROM pg_indexes
     WHERE schemaname='public' AND tablename = ANY($1)
     ORDER BY tablename, indexname`,
    [tables]
  );

  const columns = await pool.query(
    `SELECT table_name, column_name, is_nullable
     FROM information_schema.columns
     WHERE table_schema='public' AND table_name = ANY($1)
     ORDER BY table_name, ordinal_position`,
    [tables]
  );

  const orgCols = columns.rows.filter((row) => row.column_name === "organization_id");
  expect(orgCols.length === 3, "each Slice 1 table must have organization_id");
  expect(orgCols.every((row) => row.table_name !== "ai_listing_drafts" || row.is_nullable === "NO"), "ai_listing_drafts.organization_id must be NOT NULL");

  const migrations = await pool.query(`SELECT id FROM schema_migrations ORDER BY id`);
  const counts = await pool.query(
    `SELECT
       (SELECT count(*)::int FROM organizations) AS organizations,
       (SELECT count(*)::int FROM scrap_listings) AS scrap_listings,
       (SELECT count(*)::int FROM materials) AS materials,
       (SELECT count(*)::int FROM material_families) AS material_families,
       (SELECT count(*)::int FROM ai_analyses) AS ai_analyses,
       (SELECT count(*)::int FROM ai_listing_drafts) AS ai_listing_drafts,
       (SELECT count(*)::int FROM material_mapping_events) AS material_mapping_events,
       (SELECT count(*)::int FROM ai_feedback_events) AS ai_feedback_events`
  );

  const recent = await pool.query(
    `SELECT
       (SELECT count(*)::int FROM audit_events WHERE action IN ('listing.draft.created','listing.draft.updated','listing.draft.confirmed','listing.draft.rejected')) AS draft_audit,
       (SELECT count(*)::int FROM domain_outbox WHERE event_type IN ('ListingDraftCreated','ListingPublishedFromDraft','ListingDraftRejected')) AS draft_outbox`
  );

  expect(migrations.rows.some((row) => row.id === "006_phase2_intelligence"), "006_phase2_intelligence not applied");
  expect(extraCatalogs.rows.length === 0, `duplicate material catalog tables: ${extraCatalogs.rows.map((r) => r.table_name).join(",")}`);
  expect(fks.rows.some((row) => row.table_name === "ai_listing_drafts" && row.column_name === "organization_id" && row.foreign_table === "organizations"), "draft org FK missing");
  expect(fks.rows.some((row) => row.table_name === "ai_listing_drafts" && row.column_name === "material_id" && row.foreign_table === "materials"), "draft material FK missing");
  expect(indexes.rows.some((row) => row.indexname === "ai_listing_drafts_org_idx"), "draft org index missing");
  expect(indexes.rows.some((row) => row.indexname === "material_mapping_events_org_idx"), "mapping org index missing");
  expect(indexes.rows.some((row) => row.indexname === "ai_feedback_events_org_idx"), "feedback org index missing");
  expect(counts.rows[0].materials > 0, "Phase 1 materials catalog missing");
  expect(counts.rows[0].material_families >= 8, "Phase 1 families missing");

  console.log("Slice 1 schema gate: PASS");
  console.log(JSON.stringify({
    tables: found,
    migrations: migrations.rows.map((row) => row.id),
    organizationIdColumns: orgCols.map((row) => `${row.table_name}.${row.column_name}:${row.is_nullable}`),
    foreignKeys: fks.rows.map((row) => `${row.table_name}.${row.column_name}->${row.foreign_table} ON DELETE ${row.delete_rule}`),
    indexes: indexes.rows.map((row) => row.indexname),
    rowCounts: counts.rows[0],
    draftAuditOutbox: recent.rows[0],
    duplicateMaterialCatalogs: extraCatalogs.rows,
  }, null, 2));
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
