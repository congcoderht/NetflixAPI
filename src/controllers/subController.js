const SubService = require('../services/SubService');

class SubController {
  // GET /subscriptions/plans  (public)
  static async getPlans(req, res) {
    try {
      const plans = await SubService.getAllPlans();
      return res.json({ success: true, data: plans });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /subscriptions/my  (protected)
  static async getMySubscriptions(req, res) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const subs = await SubService.getUserSubscriptions(userId);
      return res.json({ success: true, data: subs });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /subscriptions/current  (protected)
  static async getCurrent(req, res) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const current = await SubService.getUserCurrentSubscription(userId);
      return res.json({ success: true, data: current });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = SubController;
