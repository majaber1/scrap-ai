async function writeOutbox(db, event) {
  await db.query(
    `INSERT INTO domain_outbox(event_type, aggregate_type, aggregate_id, organization_id, payload, status)
     VALUES ($1,$2,$3,$4,$5,'pending')`,
    [
      event.eventType,
      event.aggregateType,
      event.aggregateId || null,
      event.organizationId || null,
      JSON.stringify(event.payload || {}),
    ]
  );
}

module.exports = { writeOutbox };
