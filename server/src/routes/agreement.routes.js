const express = require("express");
const router = express.Router();
const agreementController = require("../controllers/agreement.controller");
const { protect } = require("../middleware/baseline/authGuard.middleware");
const {
  validateCreateAgreement,
} = require("../validators/agreement.validator");
const {
  logActivity,
} = require("../middleware/exceptional/activity.middleware");
const {
  verifyAgreementIntegrity,
} = require("../middleware/exceptional/integrity.middleware");

router.use(protect);

router.post(
  "/",
  validateCreateAgreement,
  logActivity("CREATE_ESCROW_AGREEMENT"),
  agreementController.createAgreement
);

router.get(
  "/",
  logActivity("FETCH_USER_AGREEMENTS"),
  agreementController.getMyAgreements
);

router.get(
  "/:id",
  verifyAgreementIntegrity,
  logActivity("VIEW_VERIFIED_AGREEMENT"),
  agreementController.getAgreementById
);

module.exports = router;
