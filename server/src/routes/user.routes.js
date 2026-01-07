const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const { protect } = require("../middleware/baseline/authGuard.middleware");
const {
  logActivity,
} = require("../middleware/exceptional/activity.middleware");

router.use(protect);

router.get(
  "/me",
  logActivity("FETCH_USER_PROFILE"),
  profileController.getProfile
);

router.put(
  "/update",
  logActivity("UPDATE_USER_PROFILE"),
  profileController.updateProfile
);

router.post(
  "/verify-id",
  logActivity("VERIFY_IDENTITY_ZK_HASH"),
  profileController.verifyIdentity
);

module.exports = router;
