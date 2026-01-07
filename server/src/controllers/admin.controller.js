const User = require("../models/User.model");
const ActivityLog = require("../models/ActivityLog.model");
const ThreatIntel = require("../models/ThreatIntel.model");
const Agreement = require("../models/Agreement.model");
const { verifyHash } = require("../utils/hmac.util");
const { sendResponse } = require("../utils/response.util");

exports.getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeAgreements = await Agreement.countDocuments({
      status: "active",
    });
    const totalThreats = await ThreatIntel.countDocuments();
    const criticalThreats = await ThreatIntel.countDocuments({
      severity: "critical",
    });

    return sendResponse(res, 200, true, "System statistics retrieved", {
      users: totalUsers,
      agreements: activeAgreements,
      threats: {
        total: totalThreats,
        critical: criticalThreats,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getThreatIntel = async (req, res, next) => {
  try {
    const threats = await ThreatIntel.find().sort({ createdAt: -1 }).limit(100);
    return sendResponse(
      res,
      200,
      true,
      "Threat intelligence logs retrieved",
      threats
    );
  } catch (error) {
    next(error);
  }
};

exports.getActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 })
      .limit(100);
    return sendResponse(res, 200, true, "Activity logs retrieved", logs);
  } catch (error) {
    next(error);
  }
};

exports.runGlobalIntegrityAudit = async (req, res, next) => {
  try {
    const agreements = await Agreement.find().sort({ createdAt: 1 });
    let previousHash = "0";
    const report = {
      totalChecked: agreements.length,
      failures: [],
      isIntegrityMaintained: true,
    };

    for (const agreement of agreements) {
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
        report.failures.push({
          id: agreement._id,
          reason: !isValid ? "Data Tampered" : "Chain Broken",
        });
        report.isIntegrityMaintained = false;
      }
      previousHash = agreement.currentHash;
    }

    return sendResponse(
      res,
      200,
      true,
      "Global integrity audit complete",
      report
    );
  } catch (error) {
    next(error);
  }
};
