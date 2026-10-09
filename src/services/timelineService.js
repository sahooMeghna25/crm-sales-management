const Timeline = require("../models/Timeline");

async function addTimeline({
  action,
  entityType,
  entityId,
  performedBy,
  previousValue,
  newValue,
}) {
  return Timeline.create({
    action,
    entityType,
    entityId,
    performedBy,
    previousValue,
    newValue,
  });
}

module.exports = { addTimeline };
