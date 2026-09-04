const { keys, configured: r2Configured, sign } = require("./r2.cjs");

function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function storageConfigured() {
  return blobConfigured() || r2Configured();
}

function storageProvider() {
  if (blobConfigured()) return "vercel-blob";
  if (r2Configured()) return "cloudflare-r2";
  return "none";
}

function storageRequired() {
  if (blobConfigured()) return ["BLOB_READ_WRITE_TOKEN"];
  if (r2Configured()) return keys;
  return ["BLOB_READ_WRITE_TOKEN"];
}

module.exports = { blobConfigured, r2Configured, storageConfigured, storageProvider, storageRequired, keys, sign };
