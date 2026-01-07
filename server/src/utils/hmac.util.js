const crypto = require("crypto");

const calculateHash = (data, previousHash) => {
  const secret = process.env.SYSTEM_HMAC_KEY;
  const dataString = JSON.stringify(data);
  const combinedString = `${dataString}${previousHash}`;

  return crypto
    .createHmac("sha256", secret)
    .update(combinedString)
    .digest("hex");
};

const verifyHash = (data, previousHash, currentHash) => {
  const calculatedHash = calculateHash(data, previousHash);
  return calculatedHash === currentHash;
};

module.exports = {
  calculateHash,
  verifyHash,
};
