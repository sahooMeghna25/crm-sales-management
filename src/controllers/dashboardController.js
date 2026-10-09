const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Deal = require("../models/Deal");
const Activity = require("../models/Activity");
const { success } = require("../utils/apiResponse");
async function summary(req, res, next) {
  try {
    const [
      totalLeads,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      totalCustomers,
      totalDeals,
      openDeals,
      wonDeals,
      lostDeals,
      revenue,
      expectedRevenue,
      pendingActivities,
      overdueActivities,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: "New" }),
      Lead.countDocuments({ status: "Qualified" }),
      Lead.countDocuments({ status: "Converted" }),
      Customer.countDocuments(),
      Deal.countDocuments(),
      Deal.countDocuments({ stage: { $nin: ["Won", "Lost"] } }),
      Deal.countDocuments({ stage: "Won" }),
      Deal.countDocuments({ stage: "Lost" }),
      Deal.aggregate([
        { $match: { stage: "Won" } },
        { $group: { _id: null, total: { $sum: "$value" } } },
      ]),
      Deal.aggregate([
        { $group: { _id: null, total: { $sum: "$expectedRevenue" } } },
      ]),
      Activity.countDocuments({ status: "Pending" }),
      Activity.countDocuments({ status: "Overdue" }),
    ]);
    const conversionRate = totalLeads
      ? Number(((convertedLeads / totalLeads) * 100).toFixed(2))
      : 0;
    success(res, "Sales summary fetched successfully", {
      totalLeads,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      totalCustomers,
      totalDeals,
      openDeals,
      wonDeals,
      lostDeals,
      totalRevenue: revenue[0]?.total || 0,
      expectedRevenue: expectedRevenue[0]?.total || 0,
      conversionRate,
      pendingActivities,
      overdueActivities,
    });
  } catch (e) {
    next(e);
  }
}
async function pipeline(req, res, next) {
  try {
    const rows = await Deal.aggregate([
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
          value: { $sum: "$value" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    success(res, "Sales pipeline fetched successfully", rows);
  } catch (e) {
    next(e);
  }
}
async function teamPerformance(req, res, next) {
  try {
    const rows = await Deal.aggregate([
      {
        $group: {
          _id: "$assignedTo",
          deals: { $sum: 1 },
          won: { $sum: { $cond: [{ $eq: ["$stage", "Won"] }, 1, 0] } },
          revenue: {
            $sum: { $cond: [{ $eq: ["$stage", "Won"] }, "$value", 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$user.name",
          deals: 1,
          won: 1,
          revenue: 1,
        },
      },
    ]);
    success(res, "Team performance fetched successfully", rows);
  } catch (e) {
    next(e);
  }
}
module.exports = { summary, pipeline, teamPerformance };
