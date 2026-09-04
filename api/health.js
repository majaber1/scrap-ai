const { pool, json } = require("../lib/server.cjs");
const { storageConfigured, storageProvider } = require("../lib/storage.cjs");

module.exports = async function(req,res){
  const storage = storageConfigured();
  const provider = storageProvider();
  try {
    if(!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
      return json(res,503,{
        status:"not_configured",
        database:false,
        session:false,
        ai:Boolean(process.env.OPENAI_API_KEY),
        storage,
        storageProvider:provider
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
      storageProvider:provider
    });
  } catch(e) {
    console.error("health_error",e);
    return json(res,503,{
      status:"error",
      database:false,
      session:Boolean(process.env.SESSION_SECRET),
      ai:Boolean(process.env.OPENAI_API_KEY),
      storage,
      storageProvider:provider
    });
  }
};
