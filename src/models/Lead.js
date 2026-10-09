const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: String,
    company: String,
    source: {
      type: String,
      enum: ["Website", "Referral", "Social Media", "Email", "Phone", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Qualified",
        "Unqualified",
        "Converted",
        "Lost",
      ],
      default: "New",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    description: String,
    convertedAt: Date,
  },
  { timestamps: true },
);

leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ email: 1 });

module.exports = mongoose.model("Lead", leadSchema);
