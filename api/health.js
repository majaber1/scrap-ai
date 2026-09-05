const { pool, json } = require("../lib/server.cjs");
const { storageConfigured, storageProvider } = require("../lib/storage.cjs");
const { aiStatus } = require("../lib/ai.cjs");

function deploymentMeta() {
  return {
    gitSha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || null,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || null,
    env: process.env.VERCEL_ENV || null,
  };
}

module.exports = async function(req,res){
  const storage = storageConfigured();
  const provider = storageProvider();
  const ai = await Promise.resolve(aiStatus());
  const deploy = deploymentMeta();
  try {
    if(!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
      return json(res,503,{
        status:"not_configured",
        database:false,
        session:false,
        ai:ai.configured,
        aiProvider:ai.provider,
        aiModel:ai.model,
        storage,
        storageProvider:provider,
        ...deploy
      });
    }
    await pool.query("SELECT 1");
    return json(res,200,{
      status:"ok",
      database:true,
      session:true,
      ai:ai.configured,
      aiProvider:ai.provider,
      aiModel:ai.model,
      aiProviders: ai.providers || [],
      storage,
      storageProvider:provider,
      v2Shell: true,
      ...deploy
    });
  } catch(e) {
    console.error("health_error",e);
    return json(res,503,{
      status:"error",
      database:false,
      session:Boolean(process.env.SESSION_SECRET),
      ai:ai.configured,
      aiProvider:ai.provider,
      aiModel:ai.model,
      storage,
      storageProvider:provider,
      ...deploy
    });
  }
};
