const Timeline = require("../models/Timeline");
const { success } = require("../utils/apiResponse");
async function getTimeline(req, res, next) {
  try {
    const rows = await Timeline.find({
      entityType: req.params.entityType,
      entityId: req.params.entityId,
    })
      .populate("performedBy", "name email role")
      .sort("-createdAt");
    success(res, "Timeline fetched successfully", rows);
  } catch (e) {
    next(e);
  }
}
module.exports = { getTimeline };
