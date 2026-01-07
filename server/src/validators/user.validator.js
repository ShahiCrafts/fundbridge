const { z } = require("zod");

const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50),
  email: z.string().email("Invalid email format").trim(),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  citizenshipHash: z.string().length(64, "Invalid ID hash format").optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format").trim(),
  password: z.string().min(1, "Password is required"),
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
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
};
