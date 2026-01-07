const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Agreement = require("../models/Agreement.model");
const { verifyHash } = require("../utils/hmac.util");

dotenv.config();

const verifyLedger = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[AUDIT] Connected to FundBridge Sentinel Database");

    const agreements = await Agreement.find().sort({ createdAt: 1 });

    if (agreements.length === 0) {
      console.log("[AUDIT] No records found to verify.");
      process.exit(0);
    }

    let isChainValid = true;
    let previousHash = "0";

    for (let i = 0; i < agreements.length; i++) {
      const agreement = agreements[i];

      const dataToVerify = {
        buyerId: agreement.buyerId,
        sellerId: agreement.sellerId,
        amount: agreement.amount,
        terms: agreement.terms,
      };

      const isValid = verifyHash(
        dataToVerify,
        agreement.prevHash,
        agreement.currentHash
      );
      const isLinkValid = agreement.prevHash === previousHash;

      if (!isValid || !isLinkValid) {
        console.error(
          `[AUDIT FAILURE] Tampering detected at Agreement ID: ${agreement._id}`
        );
        console.error(`- Data Integrity: ${isValid ? "VALID" : "CORRUPTED"}`);
        console.error(`- Chain Link: ${isLinkValid ? "VALID" : "BROKEN"}`);
        isChainValid = false;
        break;
      }

      previousHash = agreement.currentHash;
    }

    if (isChainValid) {
      console.log(
        "[AUDIT SUCCESS] Global Ledger Integrity Verified. Chain is unbroken."
      );
    }

    await mongoose.connection.close();
    process.exit(isChainValid ? 0 : 1);
  } catch (error) {
    console.error(`[AUDIT ERROR] ${error.message}`);
    process.exit(1);
  }
};

verifyLedger();
