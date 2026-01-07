const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  validateRegister,
  validateLogin,
} = require("../validators/user.validator");
const { protect } = require("../middleware/baseline/authGuard.middleware");
const {
  authLimiter,
} = require("../middleware/baseline/rateLimiter.middleware");

router.post(
  "/register",
  authLimiter,
  validateRegister,
  authController.register
);

router.post("/login", authLimiter, validateLogin, authController.login);

router.post("/logout", authController.logout);

router.post("/mfa/setup", protect, authController.setupMfa);

router.post("/mfa/verify", protect, authController.verifyMfaSetup);

router.post("/mfa/validate", protect, authController.validateMfaLogin);

module.exports = router;
