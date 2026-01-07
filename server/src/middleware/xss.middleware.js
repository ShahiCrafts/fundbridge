const { sendResponse } = require("../../utils/response.util");

const xssShield = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== "object" || obj === null) {
      if (typeof obj === "string") {
        return obj
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
          .replace(/on\w+="[^"]*"/gim, "")
          .replace(/on\w+='[^']*'/gim, "")
          .replace(/javascript:/gim, "");
      }
      return obj;
    }

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  next();
};

module.exports = { xssShield };
