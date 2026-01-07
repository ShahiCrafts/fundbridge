const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { protect } = require("../middleware/baseline/authGuard.middleware");
const { authorize } = require("../middleware/baseline/rbac.middleware");
const {
  logActivity,
} = require("../middleware/exceptional/activity.middleware");

router.use(protect);
router.use(authorize("admin"));

router.get(
  "/stats",
  logActivity("VIEW_ADMIN_STATS"),
  adminController.getSystemStats
);

router.get(
  "/threats",
  logActivity("VIEW_THREAT_INTEL"),
  adminController.getThreatIntel
);

router.get(
  "/logs",
  logActivity("VIEW_SYSTEM_LOGS"),
  adminController.getActivityLogs
);

router.post(
  "/audit/run",
  logActivity("EXECUTE_GLOBAL_INTEGRITY_AUDIT"),
  adminController.runGlobalIntegrityAudit
);

module.exports = router;
