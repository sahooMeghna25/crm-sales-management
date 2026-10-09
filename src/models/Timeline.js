const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ["Lead", "Customer", "Deal"],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

timelineSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model("Timeline", timelineSchema);
