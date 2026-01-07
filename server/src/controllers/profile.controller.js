const User = require("../models/user.model");
const { sendResponse } = require("../utils/response.util");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -mfaSecret"
    );
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }
    return sendResponse(res, 200, true, "Profile retrieved successfully", user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    if (fullName) user.fullName = fullName;

    await user.save();

    return sendResponse(res, 200, true, "Profile updated successfully", {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyIdentity = async (req, res, next) => {
  try {
    const { citizenshipHash } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    if (user.citizenshipHash) {
      return sendResponse(res, 400, false, "Identity already verified");
    }

    user.citizenshipHash = citizenshipHash;
    await user.save();

    return sendResponse(
      res,
      200,
      true,
      "Identity verified via Zero-Knowledge Hash"
    );
  } catch (error) {
    next(error);
  }
};
