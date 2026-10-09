const User = require("../models/User");
const { getPagination, paginationMeta } = require("../utils/pagination");
const { success } = require("../utils/apiResponse");

async function getUsers(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status !== undefined)
      filter.isActive = req.query.status === "active";
    if (req.query.search)
      filter.$or = [
        { name: new RegExp(req.query.search, "i") },
        { email: new RegExp(req.query.search, "i") },
      ];
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort(req.query.sort || "-createdAt")
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);
    success(
      res,
      "Users fetched successfully",
      users,
      200,
      paginationMeta(page, limit, total),
    );
  } catch (e) {
    next(e);
  }
}
async function getUser(req, res, next) {
  try {
    const u = await User.findById(req.params.id).select("-password");
    if (!u)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    success(res, "User fetched successfully", u);
  } catch (e) {
    next(e);
  }
}
async function updateUser(req, res, next) {
  try {
    const allowed = ["name", "phone", "role", "isActive"];
    const data = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) data[k] = req.body[k];
    });
    const u = await User.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!u)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    success(res, "User updated successfully", u);
  } catch (e) {
    next(e);
  }
}
async function deleteUser(req, res, next) {
  try {
    if (req.user._id.toString() === req.params.id)
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    success(res, "User deleted successfully");
  } catch (e) {
    next(e);
  }
}
module.exports = { getUsers, getUser, updateUser, deleteUser };
