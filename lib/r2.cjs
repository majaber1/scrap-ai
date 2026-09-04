const { createHash, createHmac } = require("crypto");

const keys = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"];
const configured = () => keys.every((key) => Boolean(process.env[key]));
const sha = (value) => createHash("sha256").update(value).digest("hex");
const hmac = (key, value, encoding) => createHmac("sha256", key).update(value).digest(encoding);
const enc = (value) => encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);

function sign(objectKey, method = "PUT", expires = 600) {
  const now = new Date();
  const stamp = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const day = stamp.slice(0, 8);
  const host = `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const scope = `${day}/auto/s3/aws4_request`;
  const params = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${process.env.R2_ACCESS_KEY_ID}/${scope}`,
    "X-Amz-Date": stamp,
    "X-Amz-Expires": String(expires),
    "X-Amz-SignedHeaders": "host",
  };
  const query = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${enc(key)}=${enc(value)}`)
    .join("&");
  const bucket = process.env.R2_BUCKET;
  const uri = `/${enc(bucket)}/${objectKey.split("/").map(enc).join("/")}`;
  const canonical = [method, uri, query, `host:${host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", stamp, scope, sha(canonical)].join("\n");
  const dateKey = hmac(`AWS4${process.env.R2_SECRET_ACCESS_KEY}`, day);
  const regionKey = hmac(dateKey, "auto");
  const serviceKey = hmac(regionKey, "s3");
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = hmac(signingKey, stringToSign, "hex");
  return `https://${host}${uri}?${query}&X-Amz-Signature=${signature}`;
}

module.exports = { keys, configured, sign };
