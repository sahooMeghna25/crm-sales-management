const { z } = require("zod");

const email = z.string().email();
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

module.exports = { email, objectId };
