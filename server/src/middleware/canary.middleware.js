const ThreatIntel = require("../../models/ThreatIntel.model");
const { sendResponse } = require("../../utils/response.util");

const triggerCanary = async (req, res, next) => {
  try {
    await ThreatIntel.create({
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      pathAccessed: req.originalUrl,
      userId: req.user ? req.user._id : null,
      headers: req.headers,
      payload: req.body,
      severity: "critical",
    });

    next();
  } catch (error) {
    next();
  }
};

module.exports = { triggerCanary };
