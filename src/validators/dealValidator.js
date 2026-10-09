const { z } = require("zod");
const { objectId } = require("./common");

const dealSchema = z.object({
  name: z.string().min(2),
  lead: objectId.optional(),
  customer: objectId,
  assignedTo: objectId,
  value: z.number().positive(),
  probability: z.number().min(0).max(100).optional(),
  expectedClosingDate: z.coerce.date().optional(),
  stage: z
    .enum([
      "Qualification",
      "Discovery",
      "Proposal",
      "Negotiation",
      "Won",
      "Lost",
    ])
    .optional(),
  lostReason: z.string().optional(),
  description: z.string().optional(),
});

module.exports = { dealSchema };
