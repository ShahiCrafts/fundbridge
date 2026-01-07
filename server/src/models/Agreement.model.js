const mongoose = require("mongoose");
const { calculateHash } = require("../utils/hmac.util");

const AgreementSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    terms: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "disputed", "cancelled"],
      default: "pending",
    },
    prevHash: {
      type: String,
      required: true,
      default: "0",
    },
    currentHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

AgreementSchema.pre("validate", async function (next) {
  if (this.isNew) {
    try {
      const lastRecord = await mongoose
        .model("Agreement")
        .findOne()
        .sort({ createdAt: -1 });

      this.prevHash = lastRecord ? lastRecord.currentHash : "0";

      const dataToHash = {
        buyerId: this.buyerId,
        sellerId: this.sellerId,
        amount: this.amount,
        terms: this.terms,
      };

      this.currentHash = calculateHash(dataToHash, this.prevHash);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model("Agreement", AgreementSchema);
