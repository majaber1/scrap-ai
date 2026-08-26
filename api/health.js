const { pool, json } = require("../lib/server.cjs");

const r2Configured = () => [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
].every((key) => Boolean(process.env[key]));

module.exports = async function(req,res){
  const storage = r2Configured();
  try {
    if(!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
      return json(res,503,{
        status:"not_configured",
        database:false,
        session:false,
        ai:Boolean(process.env.OPENAI_API_KEY),
        storage,
        storageProvider:storage?"cloudflare-r2":"none"
      });
    }
    await pool.query("SELECT 1");
    return json(res,200,{
      status:"ok",
      database:true,
      session:true,
      ai:Boolean(process.env.OPENAI_API_KEY),
      aiModel:process.env.OPENAI_MODEL||"gpt-5.4-mini",
      storage,
      storageProvider:storage?"cloudflare-r2":"none"
    });
  } catch(e) {
    console.error("health_error",e);
    return json(res,503,{
      status:"error",
      database:false,
      session:Boolean(process.env.SESSION_SECRET),
      ai:Boolean(process.env.OPENAI_API_KEY),
      storage,
      storageProvider:storage?"cloudflare-r2":"none"
    });
  }
};
