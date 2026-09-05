const { pool, json } = require("../../lib/server.cjs");
const { ensureSchema } = require("../../lib/schema.cjs");
const { requireUser, loadAuthz, requireOrganization, requirePermission } = require("../../lib/foundation/authz.cjs");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "method_not_allowed" });
  const session = requireUser(req, res);
  if (!session) return;
  try {
    await ensureSchema(pool);
    const ctx = await loadAuthz(pool, session);
    if (!requireOrganization(ctx, res)) return;
    if (!requirePermission(ctx, res, "material.read")) return;
    const families = await pool.query(
      `SELECT id, code, label_ar, label_en, active, sort_order FROM material_families WHERE active=true ORDER BY sort_order`
    );
    const materials = await pool.query(
      `SELECT m.id, m.family_id, m.code, m.label_ar, m.label_en, m.inspection_guidance_ar, m.inspection_guidance_en, f.code family_code
       FROM materials m JOIN material_families f ON f.id=m.family_id
       WHERE m.active=true ORDER BY m.label_en`
    );
    const grades = await pool.query(
      `SELECT g.id, g.material_id, g.code, g.label_ar, g.label_en FROM material_grades g WHERE g.active=true`
    );
    const aliases = await pool.query(
      `SELECT a.material_id, a.alias, a.locale FROM material_aliases a`
    );
    return json(res, 200, {
      families: families.rows,
      materials: materials.rows,
      grades: grades.rows,
      aliases: aliases.rows,
    });
  } catch (error) {
    console.error("v2_materials_error", error);
    return json(res, 500, { error: "server_error" });
  }
};
