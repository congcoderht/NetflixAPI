const express = require("express");
const router = express.Router();
const AdminStatsController = require("../../controllers/admin/adminStatsController");
const { authenticate,authorize } = require("../../middleware/auth");

router.use(authenticate);
router.use(authorize("admin"));

router.get('/dashboard', AdminStatsController.getDashboardOverview);
router.get('/revenue', AdminStatsController.getRevenueOverview);

module.exports = router;