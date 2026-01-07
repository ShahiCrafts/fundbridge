const rateLimit = require("express-rate-limit");
const { sendResponse } = require("../../utils/response.util");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    return sendResponse(
      res,
      429,
      false,
      "Too many login attempts. Please try again after 15 minutes."
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const sensitiveActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    return sendResponse(
      res,
      429,
      false,
      "Action limit reached. Please try again later to ensure system integrity."
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  sensitiveActionLimiter,
};
