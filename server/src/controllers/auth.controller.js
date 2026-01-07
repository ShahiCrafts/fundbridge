const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/response.util");
const {
  generateMfaSecret,
  generateQrCode,
  verifyMfaToken,
} = require("../utils/totp.util");

/**
 * Utility to sign JWTs for sessions
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, citizenshipHash } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendResponse(res, 400, false, "User already exists");
    }

    const user = await User.create({
      fullName,
      email,
      password,
      citizenshipHash,
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    return sendResponse(res, 201, true, "User registered successfully", {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 401, false, "Invalid credentials");
    }

    // Account Lockout Check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return sendResponse(res, 403, false, "Account is temporarily locked");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
        user.failedLoginAttempts = 0;
      }
      await user.save();
      return sendResponse(res, 401, false, "Invalid credentials");
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Check if MFA is active - if so, trigger the challenge
    if (user.isMfaActive) {
      const tempToken = generateToken(user._id);
      return sendResponse(res, 200, true, "MFA required", {
        mfaRequired: true,
        tempToken, // Temporary token to access /mfa/validate
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    return sendResponse(res, 200, true, "Login successful", {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initiate MFA setup by generating a TOTP secret and QR code
 */
exports.setupMfa = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.isMfaActive) {
      return sendResponse(res, 400, false, "MFA is already active");
    }

    const { otpauth_url, encryptedSecret } = generateMfaSecret(user.email);
    const qrCode = await generateQrCode(otpauth_url);

    user.mfaSecret = encryptedSecret;
    await user.save();

    return sendResponse(res, 200, true, "MFA setup initiated", { qrCode });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify the initial TOTP token to activate MFA for the account
 */
exports.verifyMfaSetup = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.mfaSecret) {
      return sendResponse(res, 400, false, "MFA setup not initiated");
    }

    const isValid = verifyMfaToken(token, user.mfaSecret);
    if (!isValid) {
      return sendResponse(res, 401, false, "Invalid MFA verification token");
    }

    user.isMfaActive = true;
    await user.save();

    return sendResponse(res, 200, true, "MFA activated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Final step of login challenge - verify TOTP token for active MFA users
 */
exports.validateMfaLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.isMfaActive) {
      return sendResponse(res, 400, false, "MFA is not enabled for this user");
    }

    const isValid = verifyMfaToken(token, user.mfaSecret);
    if (!isValid) {
      return sendResponse(res, 401, false, "Invalid MFA code");
    }

    const finalToken = generateToken(user._id);

    res.cookie("token", finalToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    return sendResponse(res, 200, true, "MFA verified, login successful", {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  return sendResponse(res, 200, true, "Logged out successfully");
};
