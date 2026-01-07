const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { encrypt, decrypt } = require("./aes.util");

const generateMfaSecret = (email) => {
  const secret = speakeasy.generateSecret({
    issuer: "FundBridge",
    name: `FundBridge:${email}`,
    length: 20,
  });

  return {
    otpauth_url: secret.otpauth_url,
    base32: secret.base32,
    encryptedSecret: encrypt(secret.base32),
  };
};

const generateQrCode = async (otpauthUrl) => {
  try {
    return await qrcode.toDataURL(otpauthUrl);
  } catch (err) {
    throw new Error("Failed to generate QR code");
  }
};

const verifyMfaToken = (token, encryptedSecret) => {
  const secret = decrypt(encryptedSecret);
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
};

module.exports = {
  generateMfaSecret,
  generateQrCode,
  verifyMfaToken,
};
