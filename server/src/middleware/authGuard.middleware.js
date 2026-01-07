const jwt = require("jsonwebtoken");
const User = require("../../models/User.model");
const { sendResponse } = require("../../utils/response.util");

const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return sendResponse(res, 401, false, "Not authorized to access this route");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return sendResponse(res, 401, false, "User no longer exists");
    }

    if (req.user.lockUntil && req.user.lockUntil > Date.now()) {
      return sendResponse(res, 403, false, "Account is currently locked");
    }

    next();
  } catch (error) {
    return sendResponse(res, 401, false, "Not authorized, token failed");
  }
};

module.exports = { protect };
