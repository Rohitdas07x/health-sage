const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const uploadSchema = z.object({
  reportType: z.enum(["blood", "urine", "imaging", "other"]).optional(),
});

const validateUpload = (req, res, next) => {
  const result = uploadSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues.map((i) => i.message) });
  }
  next();
};

const validateRegister = (req, res, next) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues.map((i) => i.message) });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues.map((i) => i.message) });
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateUpload };