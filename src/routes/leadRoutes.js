const router = require("express").Router();
const c = require("../controllers/leadController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const { leadSchema } = require("../validators/leadValidator");
router.use(protect);
router.post("/", validate(leadSchema), c.createLead);
router.get("/", c.getLeads);
router.get("/:id", c.getLead);
router.patch("/:id", c.updateLead);
router.patch("/:id/status", c.updateStatus);
router.patch("/:id/assign", allowRoles("Admin", "Sales Manager"), c.assignLead);
router.post(
  "/:id/convert",
  allowRoles("Admin", "Sales Manager", "Sales Executive"),
  c.convertLead,
);
router.delete("/:id", c.deleteLead);
module.exports = router;
