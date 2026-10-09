const Deal = require("../models/Deal");
const { getPagination, paginationMeta } = require("../utils/pagination");
const { success } = require("../utils/apiResponse");
const { addTimeline } = require("../services/timelineService");
function filter(req) {
  const f = {};
  if (req.user.role === "Sales Executive") f.assignedTo = req.user._id;
  else if (req.query.assignedTo) f.assignedTo = req.query.assignedTo;
  if (req.query.stage) f.stage = req.query.stage;
  if (req.query.status) f.stage = req.query.status;
  if (req.query.minAmount || req.query.maxAmount) {
    f.value = {};
    if (req.query.minAmount) f.value.$gte = Number(req.query.minAmount);
    if (req.query.maxAmount) f.value.$lte = Number(req.query.maxAmount);
  }
  if (req.query.closingDate)
    f.expectedClosingDate = { $lte: new Date(req.query.closingDate) };
  return f;
}
async function createDeal(req, res, next) {
  try {
    const d = await Deal.create(req.body);
    await addTimeline({
      action: "Deal created",
      entityType: "Deal",
      entityId: d._id,
      performedBy: req.user._id,
    });
    success(res, "Deal created successfully", d, 201);
  } catch (e) {
    next(e);
  }
}
async function getDeals(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query),
      f = filter(req);
    const [d, total] = await Promise.all([
      Deal.find(f)
        .populate("customer", "name email")
        .populate("lead", "name email")
        .populate("assignedTo", "name email")
        .sort(req.query.sort || "-createdAt")
        .skip(skip)
        .limit(limit),
      Deal.countDocuments(f),
    ]);
    success(
      res,
      "Deals fetched successfully",
      d,
      200,
      paginationMeta(page, limit, total),
    );
  } catch (e) {
    next(e);
  }
}
async function getDeal(req, res, next) {
  try {
    const d = await Deal.findById(req.params.id)
      .populate("customer")
      .populate("lead")
      .populate("assignedTo", "name email role");
    if (!d)
      return res
        .status(404)
        .json({ success: false, message: "Deal not found" });
    if (
      req.user.role === "Sales Executive" &&
      String(d.assignedTo?._id) !== String(req.user._id)
    )
      return res.status(403).json({ success: false, message: "Access denied" });
    success(res, "Deal fetched successfully", d);
  } catch (e) {
    next(e);
  }
}
async function updateDeal(req, res, next) {
  try {
    const d = await Deal.findById(req.params.id);
    if (!d)
      return res
        .status(404)
        .json({ success: false, message: "Deal not found" });
    if (
      req.user.role === "Sales Executive" &&
      String(d.assignedTo) !== String(req.user._id)
    )
      return res.status(403).json({ success: false, message: "Access denied" });
    if (
      ["Won", "Lost"].includes(d.stage) &&
      req.body.stage &&
      req.body.stage !== d.stage
    )
      return res.status(400).json({
        success: false,
        message: "Closed deals cannot move back to an active stage",
      });
    const oldStage = d.stage;
    Object.assign(d, req.body);
    await d.save();
    if (oldStage !== d.stage)
      await addTimeline({
        action: "Deal stage changed",
        entityType: "Deal",
        entityId: d._id,
        performedBy: req.user._id,
        previousValue: oldStage,
        newValue: d.stage,
      });
    if (d.stage === "Won")
      await addTimeline({
        action: "Deal won",
        entityType: "Deal",
        entityId: d._id,
        performedBy: req.user._id,
      });
    if (d.stage === "Lost")
      await addTimeline({
        action: "Deal lost",
        entityType: "Deal",
        entityId: d._id,
        performedBy: req.user._id,
      });
    success(res, "Deal updated successfully", d);
  } catch (e) {
    next(e);
  }
}
async function deleteDeal(req, res, next) {
  try {
    const d = await Deal.findById(req.params.id);
    if (!d)
      return res
        .status(404)
        .json({ success: false, message: "Deal not found" });
    if (
      req.user.role === "Sales Executive" &&
      String(d.assignedTo) !== String(req.user._id)
    )
      return res.status(403).json({ success: false, message: "Access denied" });
    await d.deleteOne();
    success(res, "Deal deleted successfully");
  } catch (e) {
    next(e);
  }
}
module.exports = { createDeal, getDeals, getDeal, updateDeal, deleteDeal };
