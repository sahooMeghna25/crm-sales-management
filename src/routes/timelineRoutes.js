const router = require("express").Router();
const c = require("../controllers/timelineController");
const { protect } = require("../middleware/authMiddleware");
router.use(protect);
router.get("/:entityType/:entityId", c.getTimeline);
module.exports = router;
