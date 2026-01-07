const mongoose = require("mongoose");

const ThreatIntelSchema = new mongoose.Schema(
  {
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    pathAccessed: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "high",
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ThreatIntel", ThreatIntelSchema);
