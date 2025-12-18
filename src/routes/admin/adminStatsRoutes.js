const express = require("express");
const router = express.Router();
const AdminStatsController = require("../../controllers/admin/adminStatsController");
const verifyAdmin = require("../../middleware/admin/verifyAdmin");
const { authenticate } = require("../../middleware/auth");

router.use(authenticate);
router.get('/dashboard', verifyAdmin, AdminStatsController.getDashboardOverview);

module.exports = router;