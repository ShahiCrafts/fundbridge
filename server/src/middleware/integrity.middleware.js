const Agreement = require("../../models/Agreement.model");
const { verifyHash } = require("../../utils/hmac.util");
const { sendResponse } = require("../../utils/response.util");

const verifyAgreementIntegrity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agreement = await Agreement.findById(id);

    if (!agreement) {
      return sendResponse(res, 404, false, "Agreement not found");
    }

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

    if (!isValid) {
      return sendResponse(
        res,
        403,
        false,
        "System integrity breach detected: Agreement data has been tampered with"
      );
    }

    req.agreement = agreement;
    next();
  } catch (error) {
    return sendResponse(res, 500, false, "Internal integrity check failed");
  }
};

module.exports = { verifyAgreementIntegrity };
