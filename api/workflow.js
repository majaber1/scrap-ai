const { pool, requireSession, json } = require("../lib/server.cjs");
module.exports = async function handler(req,res){
 const s=requireSession(req,res);if(!s)return;
 try{
  if(req.method==="GET"){
   const [listings,offers,pickups]=await Promise.all([
    pool.query(`SELECT l.*,o.name seller_name FROM scrap_listings l JOIN organizations o ON o.id=l.seller_org_id
      WHERE l.status='open' OR l.seller_org_id=$1 ORDER BY l.created_at DESC`,[s.organizationId]),
    pool.query(`SELECT f.*,l.seller_org_id,l.title,o.name buyer_name FROM offers f JOIN scrap_listings l ON l.id=f.listing_id
      JOIN organizations o ON o.id=f.buyer_org_id WHERE f.buyer_org_id=$1 OR l.seller_org_id=$1 ORDER BY f.created_at DESC`,[s.organizationId]),
    pool.query(`SELECT p.*,l.title FROM pickups p JOIN scrap_listings l ON l.id=p.listing_id
      JOIN offers f ON f.id=p.offer_id WHERE l.seller_org_id=$1 OR f.buyer_org_id=$1 ORDER BY p.created_at DESC`,[s.organizationId])
   ]);return json(res,200,{listings:listings.rows,offers:offers.rows,pickups:pickups.rows});
  }
  if(req.method!=="POST")return json(res,405,{error:"method_not_allowed"});
  const a=String(req.body?.action||""),b=req.body||{};
  if(a==="createListing"){const r=await pool.query(`INSERT INTO scrap_listings(seller_org_id,title,material,quantity,unit,city,indicative_value,image_url)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[s.organizationId,b.title,b.material,b.quantity,b.unit||"kg",b.city,b.indicativeValue||null,b.imageUrl||null]);return json(res,201,{listing:r.rows[0]});}
  if(a==="submitOffer"){const r=await pool.query(`INSERT INTO offers(listing_id,buyer_org_id,amount)
    SELECT id,$1,$3 FROM scrap_listings WHERE id=$2 AND seller_org_id<>$1 AND status='open' RETURNING *`,[s.organizationId,b.listingId,b.amount]);if(!r.rows[0])return json(res,400,{error:"listing_unavailable"});return json(res,201,{offer:r.rows[0]});}
  if(a==="acceptOffer"){const client=await pool.connect();try{await client.query("BEGIN");const r=await client.query(`UPDATE offers f SET status='accepted' FROM scrap_listings l WHERE f.id=$1 AND f.listing_id=l.id AND l.seller_org_id=$2 RETURNING f.*`,[b.offerId,s.organizationId]);if(!r.rows[0]){await client.query("ROLLBACK");return json(res,404,{error:"offer_not_found"});}await client.query("UPDATE scrap_listings SET status='pickup' WHERE id=$1",[r.rows[0].listing_id]);const p=await client.query("INSERT INTO pickups(listing_id,offer_id,scheduled_at,address_text) VALUES($1,$2,$3,$4) RETURNING *",[r.rows[0].listing_id,r.rows[0].id,b.scheduledAt||null,b.address||null]);await client.query("COMMIT");return json(res,200,{offer:r.rows[0],pickup:p.rows[0]});}catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}}
  return json(res,400,{error:"invalid_action"});
 }catch(e){console.error("workflow_error",e);return json(res,500,{error:"server_error"});}
};
