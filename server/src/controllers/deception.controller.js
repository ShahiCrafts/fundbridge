const { sendResponse } = require("../utils/response.util");

exports.handleDecoyAccess = (req, res) => {
  return sendResponse(res, 200, true, "Operation successful", {
    backup_status: "isolated",
    last_sync: new Date().toISOString(),
    nodes_active: 12,
    integrity_hash:
      "f3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  });
};

exports.handleSecretTrap = (req, res) => {
  return sendResponse(res, 200, true, "System configuration retrieved", {
    encryption_level: "AES-512-PRO",
    rotation_cycle: "300s",
    canary_mode: "active",
    master_seed_fragment: "89af...22bc",
  });
};
