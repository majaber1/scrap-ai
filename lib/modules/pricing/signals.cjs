function explainRange(signals) {
  if (!signals.length) {
    return {
      range: null,
      currency: "SAR",
      confidence: 0,
      notice: "price_source_not_connected",
      factors: [
        { ar: "لا يوجد مصدر أسعار ببروفنانس متصل", en: "No priced source with provenance is connected" },
        { ar: "لن نعرض سعراً مخترعاً", en: "A fabricated unit price will not be shown" },
      ],
    };
  }
  const mins = signals.map((row) => Number(row.price_min)).filter(Number.isFinite);
  const maxs = signals.map((row) => Number(row.price_max)).filter(Number.isFinite);
  const conf = signals.map((row) => Number(row.confidence)).filter(Number.isFinite);
  return {
    range: {
      min: mins.length ? Math.min(...mins) : null,
      max: maxs.length ? Math.max(...maxs) : null,
    },
    currency: signals[0].currency || "SAR",
    confidence: conf.length ? conf.reduce((a, b) => a + b, 0) / conf.length : null,
    notice: null,
    factors: signals.map((row) => ({
      ar: `مصدر: ${row.source_type} · ${row.region || "غير محدد"}`,
      en: `Source: ${row.source_type} · ${row.region || "unspecified"}`,
    })),
  };
}

module.exports = { explainRange };
