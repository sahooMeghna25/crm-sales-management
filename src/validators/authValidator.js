const { z } = require("zod");
const { email } = require("./common");

const registerSchema = z.object({
  name: z.string().min(2),
  email,
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(["Admin", "Sales Manager", "Sales Executive"]).optional(),
});
const loginSchema = z.object({ email, password: z.string().min(1) });

module.exports = { registerSchema, loginSchema };
