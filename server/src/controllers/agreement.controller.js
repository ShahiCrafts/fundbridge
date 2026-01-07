const Agreement = require("../models/Agreement.model");
const { sendResponse } = require("../utils/response.util");

exports.createAgreement = async (req, res, next) => {
  try {
    const { sellerId, amount, terms } = req.body;
    const buyerId = req.user._id;

    if (buyerId.toString() === sellerId) {
      return sendResponse(
        res,
        400,
        false,
        "You cannot create an agreement with yourself"
      );
    }

    const agreement = await Agreement.create({
      buyerId,
      sellerId,
      amount,
      terms,
    });

    return sendResponse(
      res,
      201,
      true,
      "Agreement created and cryptographically chained",
      agreement
    );
  } catch (error) {
    next(error);
  }
};

exports.getMyAgreements = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const agreements = await Agreement.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    }).sort({ createdAt: -1 });

    return sendResponse(
      res,
      200,
      true,
      "Agreements retrieved successfully",
      agreements
    );
  } catch (error) {
    next(error);
  }
};

exports.getAgreementById = async (req, res, next) => {
  try {
    const agreement = req.agreement;
    return sendResponse(
      res,
      200,
      true,
      "Agreement retrieved and integrity verified",
      agreement
    );
  } catch (error) {
    next(error);
  }
};
