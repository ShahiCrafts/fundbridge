const { sendResponse } = require("../../utils/response.util");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendResponse(res, 401, false, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      return sendResponse(
        res,
        403,
        false,
        `User role ${req.user.role} is not authorized to access this route`
      );
    }

    next();
  };
};

module.exports = { authorize };
