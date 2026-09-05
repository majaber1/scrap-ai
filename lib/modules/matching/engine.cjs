function scoreBuyer({ sameMaterialOffer, hasBuyerRole, sameCity }) {
  let score = 0;
  const factors = [];
  if (hasBuyerRole) {
    score += 0.5;
    factors.push("buyer_capability");
  }
  if (sameCity) {
    score += 0.2;
    factors.push("city_overlap");
  }
  if (sameMaterialOffer) {
    score += 0.3;
    factors.push("prior_material_interest");
  }
  return { score: Math.min(1, Number(score.toFixed(3))), factors };
}

module.exports = { scoreBuyer };
