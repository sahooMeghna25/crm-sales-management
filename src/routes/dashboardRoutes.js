const router = require("express").Router();
const c = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
router.use(protect, allowRoles("Admin", "Sales Manager"));
router.get("/summary", c.summary);
router.get("/pipeline", c.pipeline);
router.get("/team-performance", c.teamPerformance);
module.exports = router;
