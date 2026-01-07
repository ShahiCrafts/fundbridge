const crypto = require("crypto");
const { sendResponse } = require("../../utils/response.util");

const mtdShield = (req, res, next) => {
  const timeWindow = Math.floor(Date.now() / (5 * 60 * 1000));
  const systemSecret =
    process.env.MTD_PATH_SEED || "fundbridge-mtd-default-seed";

  const expectedHash = crypto
    .createHmac("sha256", systemSecret)
    .update(timeWindow.toString())
    .digest("hex")
    .substring(0, 12);

  const pathParts = req.path.split("/");

  if (pathParts.includes("mtd")) {
    const mtdIndex = pathParts.indexOf("mtd");
    const providedHash = pathParts[mtdIndex + 1];

    if (providedHash !== expectedHash) {
      const prevWindow = timeWindow - 1;
      const prevHash = crypto
        .createHmac("sha256", systemSecret)
        .update(prevWindow.toString())
        .digest("hex")
        .substring(0, 12);

      if (providedHash !== prevHash) {
        return sendResponse(
          res,
          404,
          false,
          "Security Protocol: Endpoint has moved or expired"
        );
      }
    }

    req.url = req.url.replace(`/mtd/${providedHash}`, "");
  }

  next();
};

const getMtdPrefix = () => {
  const timeWindow = Math.floor(Date.now() / (5 * 60 * 1000));
  const systemSecret =
    process.env.MTD_PATH_SEED || "fundbridge-mtd-default-seed";

  const hash = crypto
    .createHmac("sha256", systemSecret)
    .update(timeWindow.toString())
    .digest("hex")
    .substring(0, 12);

  return `/mtd/${hash}`;
};

module.exports = { mtdShield, getMtdPrefix };
