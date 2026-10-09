const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "Call",
        "Email",
        "Meeting",
        "Demo",
        "Follow-up",
        "Reminder",
        "Note",
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Overdue"],
      default: "Pending",
    },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: "Deal" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completedAt: Date,
  },
  { timestamps: true },
);

activitySchema.index({ dueDate: 1, status: 1 });
activitySchema.index({ assignedTo: 1 });

module.exports = mongoose.model("Activity", activitySchema);
