const { z } = require("zod");
const mongoose = require("mongoose");

const createAgreementSchema = z.object({
  sellerId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid Seller ID format",
  }),
  amount: z.number().positive("Amount must be greater than zero"),
  terms: z
    .string()
    .min(10, "Terms must be at least 10 characters long")
    .max(2000),
});

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: error.errors.map((err) => ({
        path: err.path[0],
        message: err.message,
      })),
    });
  }
};

module.exports = {
  validateCreateAgreement: validate(createAgreementSchema),
};
