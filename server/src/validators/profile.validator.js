const { z } = require("zod");

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(50).optional(),
  bio: z.string().max(200).optional(),
});

const identityVerifySchema = z.object({
  citizenshipHash: z.string().length(64),
});

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Input validation failed",
      errors: error.errors.map((err) => ({
        path: err.path[0],
        message: err.message,
      })),
    });
  }
};

module.exports = {
  validateUpdateProfile: validate(updateProfileSchema),
  validateIdentityVerify: validate(identityVerifySchema),
};
