const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    value: { type: Number, required: true, min: 0.01 },
    probability: { type: Number, min: 0, max: 100, default: 50 },
    expectedRevenue: { type: Number, min: 0 },
    expectedClosingDate: Date,
    stage: {
      type: String,
      enum: [
        "Qualification",
        "Discovery",
        "Proposal",
        "Negotiation",
        "Won",
        "Lost",
      ],
      default: "Qualification",
    },
    lostReason: String,
    description: String,
  },
  { timestamps: true },
);

dealSchema.pre("validate", function (next) {
  this.expectedRevenue = Number(
    (this.value * (this.probability / 100)).toFixed(2),
  );
  if (this.stage === "Lost" && !this.lostReason)
    return next(new Error("Lost reason is required for a lost deal"));
  next();
});

dealSchema.index({ stage: 1 });
dealSchema.index({ assignedTo: 1 });
dealSchema.index({ value: 1 });
dealSchema.index({ expectedClosingDate: 1 });

module.exports = mongoose.model("Deal", dealSchema);
