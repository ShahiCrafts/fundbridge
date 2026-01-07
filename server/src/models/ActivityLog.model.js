const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
