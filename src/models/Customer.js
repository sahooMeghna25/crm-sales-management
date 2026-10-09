const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: String,
    company: String,
    address: String,
    originalLead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true },
);

customerSchema.index({ email: 1 });
customerSchema.index({ assignedTo: 1 });
customerSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Customer", customerSchema);
