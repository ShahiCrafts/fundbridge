const ActivityLog = require("../../models/ActivityLog.model");

const logActivity = (actionDescription) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
      res.locals.responseBody = body;
      return originalSend.apply(res, arguments);
    };

    res.on("finish", async () => {
      try {
        if (!req.user) return;

        const logEntry = {
          userId: req.user._id,
          action: actionDescription || `${req.method} ${req.path}`,
          method: req.method,
          path: req.path,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent"),
          status: res.statusCode < 400 ? "success" : "failure",
          details: {
            query: req.query,
            statusCode: res.statusCode,
          },
        };

        await ActivityLog.create(logEntry);
      } catch (error) {
        console.error("[LOGGING ERROR]", error.message);
      }
    });

    next();
  };
};

module.exports = { logActivity };
