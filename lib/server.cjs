const { Pool } = require("pg");
const { scryptSync, randomBytes, timingSafeEqual, createHmac } = require("crypto");

const connectionString = process.env.DATABASE_URL?.replace("sslmode=require", "sslmode=verify-full");
const pool = global.__marketPool || new Pool({ connectionString, max: 3 });
global.__marketPool = pool;
const secret = process.env.SESSION_SECRET || "";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
function verifyPassword(password, stored) {
  const [salt, expected] = String(stored).split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}
function session(req) {
  if (!secret || secret.length < 32) return null;
  const raw = String(req.headers.cookie || "").split(";").map(x => x.trim()).find(x => x.startsWith("session="))?.slice(8);
  if (!raw) return null;
  const [body, signature] = raw.split(".");
  const expected = createHmac("sha256", secret).update(body || "").digest("base64url");
  if (!signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const value = JSON.parse(Buffer.from(body, "base64url").toString());
    return value.exp > Date.now() ? value : null;
  } catch { return null; }
}
function setSession(res, value) {
  const token = sign({ ...value, exp: Date.now() + 7 * 86400000 });
  res.setHeader("Set-Cookie", `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`);
}
function clearSession(res) { res.setHeader("Set-Cookie", "session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"); }
function json(res, status, value) { res.status(status).json(value); }
function requireSession(req, res) { const value = session(req); if (!value) json(res, 401, { error: "authentication_required" }); return value; }
module.exports = { pool, hashPassword, verifyPassword, setSession, clearSession, session, requireSession, json };
