const Lead = require("../models/Lead");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Deal = require("../models/Deal");
const mongoose = require("mongoose");
const { getPagination, paginationMeta } = require("../utils/pagination");
const { success } = require("../utils/apiResponse");
const { addTimeline } = require("../services/timelineService");

function leadFilter(req) {
  const f = {};
  if (req.user.role === "Sales Executive") f.assignedTo = req.user._id;
  else if (req.query.assignedTo) f.assignedTo = req.query.assignedTo;
  if (req.query.status) f.status = req.query.status;
  if (req.query.priority) f.priority = req.query.priority;
  if (req.query.source) f.source = req.query.source;
  if (req.query.search)
    f.$or = [
      { name: new RegExp(req.query.search, "i") },
      { email: new RegExp(req.query.search, "i") },
      { company: new RegExp(req.query.search, "i") },
    ];
  if (req.query.from || req.query.to) {
    f.createdAt = {};
    if (req.query.from) f.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) f.createdAt.$lte = new Date(req.query.to);
  }
  return f;
}
async function createLead(req, res, next) {
  try {
    if (req.body.assignedTo) {
      const u = await User.findOne({
        _id: req.body.assignedTo,
        isActive: true,
        role: "Sales Executive",
      });
      if (!u)
        return res.status(400).json({
          success: false,
          message: "Assigned user must be an active Sales Executive",
        });
    }
    const lead = await Lead.create(req.body);
    await addTimeline({
      action: "Lead created",
      entityType: "Lead",
      entityId: lead._id,
      performedBy: req.user._id,
    });
    success(res, "Lead created successfully", lead, 201);
  } catch (e) {
    next(e);
  }
}
async function getLeads(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const f = leadFilter(req);
    const [leads, total] = await Promise.all([
      Lead.find(f)
        .populate("assignedTo", "name email role")
        .sort(req.query.sort || "-createdAt")
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(f),
    ]);
    success(
      res,
      "Leads fetched successfully",
      leads,
      200,
      paginationMeta(page, limit, total),
    );
  } catch (e) {
    next(e);
  }
}
async function getLead(req, res, next) {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      "assignedTo",
      "name email role",
    );
    if (!lead)
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    if (
      req.user.role === "Sales Executive" &&
      String(lead.assignedTo?._id) !== String(req.user._id)
    )
      return res.status(403).json({ success: false, message: "Access denied" });
    success(res, "Lead fetched successfully", lead);
  } catch (e) {
    next(e);
  }
}
async function updateLead(req, res, next) {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead)
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    if (
      req.user.role === "Sales Executive" &&
      String(lead.assignedTo) !== String(req.user._id)
    )
      return res.status(403).json({ success: false, message: "Access denied" });
    const old = lead.toObject();
    Object.assign(lead, req.body);
    await lead.save();
    await addTimeline({
      action: "Lead updated",
      entityType: "Lead",
      entityId: lead._id,
      performedBy: req.user._id,
      previousValue: old,
      newValue: lead.toObject(),
    });
    success(res, "Lead updated successfully", lead);
  } catch (e) {
    next(e);
  }
}
async function updateStatus(req, res, next) {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead)
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    if (
      req.user.role === "Sales Executive" &&
      String(lead.assignedTo) !== String(req.user._id)
    )
      return res.status(403).json({ success: false, message: "Access denied" });
    if (lead.status === "Converted")
      return res.status(400).json({
        success: false,
        message: "Converted lead cannot change status",
      });
    const old = lead.status;
    lead.status = req.body.status;
    await lead.save();
    await addTimeline({
      action: "Lead status changed",
      entityType: "Lead",
      entityId: lead._id,
      performedBy: req.user._id,
      previousValue: old,
      newValue: lead.status,
    });
    success(res, "Lead status updated successfully", lead);
  } catch (e) {
    next(e);
  }
}
async function assignLead(req, res, next) {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead)
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    const user = await User.findOne({
      _id: req.body.assignedTo,
      isActive: true,
      role: "Sales Executive",
    });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "Lead can only be assigned to an active Sales Executive",
      });
    const old = lead.assignedTo;
    lead.assignedTo = user._id;
    await lead.save();
    await addTimeline({
      action: old ? "Lead reassigned" : "Lead assigned",
      entityType: "Lead",
      entityId: lead._id,
      performedBy: req.user._id,
      previousValue: old,
      newValue: user._id,
    });
    success(res, "Lead assigned successfully", lead);
  } catch (e) {
    next(e);
  }
}
async function deleteLead(req, res, next) {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead)
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    if (
      req.user.role === "Sales Executive" &&
      String(lead.assignedTo) !== String(req.user._id)
    )
      return res.status(403).json({ success: false, message: "Access denied" });
    if (lead.status === "Converted")
      return res
        .status(400)
        .json({ success: false, message: "Converted lead cannot be deleted" });
    await lead.deleteOne();
    success(res, "Lead deleted successfully");
  } catch (e) {
    next(e);
  }
}
async function convertLead(req, res, next) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const lead = await Lead.findById(req.params.id).session(session);
    if (!lead)
      throw Object.assign(new Error("Lead not found"), { statusCode: 404 });
    if (lead.status !== "Qualified")
      throw Object.assign(new Error("Only qualified leads can be converted"), {
        statusCode: 400,
      });
    if (lead.status === "Converted" || lead.convertedAt)
      throw Object.assign(new Error("Lead already converted"), {
        statusCode: 400,
      });
    const assignedTo = lead.assignedTo || req.user._id;
    const customer = (
      await Customer.create(
        [
          {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            originalLead: lead._id,
            assignedTo,
          },
        ],
        { session },
      )
    )[0];
    const deal = (
      await Deal.create(
        [
          {
            name: req.body.dealName || `${lead.company || lead.name} Deal`,
            lead: lead._id,
            customer: customer._id,
            assignedTo,
            value: req.body.value || 1,
            probability: req.body.probability ?? 50,
            expectedClosingDate: req.body.expectedClosingDate,
            description: req.body.description,
          },
        ],
        { session },
      )
    )[0];
    lead.status = "Converted";
    lead.convertedAt = new Date();
    await lead.save({ session });
    await Timeline.create(
      [
        {
          action: "Lead converted",
          entityType: "Lead",
          entityId: lead._id,
          performedBy: req.user._id,
          newValue: { customerId: customer._id, dealId: deal._id },
        },
      ],
      { session },
    );
    await session.commitTransaction();
    success(res, "Lead converted successfully", { lead, customer, deal }, 201);
  } catch (e) {
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
}
module.exports = {
  createLead,
  getLeads,
  getLead,
  updateLead,
  updateStatus,
  assignLead,
  deleteLead,
  convertLead,
};
