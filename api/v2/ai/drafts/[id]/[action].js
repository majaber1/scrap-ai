const { json } = require("../../../../../lib/server.cjs");
const { handleV2 } = require("../../../../../lib/foundation/v2-http.cjs");

module.exports = async function handler(req, res) {
  try {
    await handleV2(req, res);
  } catch (error) {
    console.error("v2_ai_draft_action_error", error);
    if (!res.headersSent) json(res, 500, { error: "server_error" });
  }
};
