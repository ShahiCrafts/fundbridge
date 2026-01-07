const express = require("express");
const router = express.Router();
const deceptionController = require("../controllers/deception.controller");
const {
  triggerCanary,
} = require("../middleware/exceptional/canary.middleware");

router.get(
  "/admin-logs-backup",
  triggerCanary,
  deceptionController.handleDecoyAccess
);
router.get(
  "/system-secrets",
  triggerCanary,
  deceptionController.handleSecretTrap
);
router.post(
  "/config/update",
  triggerCanary,
  deceptionController.handleSecretTrap
);

module.exports = router;
