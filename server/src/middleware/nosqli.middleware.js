const { sendResponse } = require("../../utils/response.util");

const nosqliShield = (req, res, next) => {
  const hasProhibitedOperator = (obj) => {
    if (typeof obj !== "object" || obj === null) return false;

    for (const key in obj) {
      // Check for keys starting with $ or containing . which are used in NoSQL injection
      if (key.startsWith("$") || key.includes(".")) {
        return true;
      }
      // Recurse into nested objects
      if (hasProhibitedOperator(obj[key])) {
        return true;
      }
    }
    return false;
  };

  const isSuspicious =
    hasProhibitedOperator(req.body) ||
    hasProhibitedOperator(req.query) ||
    hasProhibitedOperator(req.params);

  if (isSuspicious) {
    return sendResponse(
      res,
      400,
      false,
      "Malicious request structure detected and blocked"
    );
  }

  next();
};

module.exports = { nosqliShield };
