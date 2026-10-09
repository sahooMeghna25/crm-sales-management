const { z } = require("zod");
const { email, objectId } = require("./common");

const leadSchema = z.object({
  name: z.string().min(2),
  email,
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z
    .enum(["Website", "Referral", "Social Media", "Email", "Phone", "Other"])
    .optional(),
  status: z
    .enum(["New", "Contacted", "Qualified", "Unqualified", "Converted", "Lost"])
    .optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  assignedTo: objectId.nullish(),
  description: z.string().optional(),
});

module.exports = { leadSchema };
