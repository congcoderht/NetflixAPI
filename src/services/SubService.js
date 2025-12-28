const SubRepository = require('../repositories/SubRepository');

class SubService {
  static async getAllPlans() {
    const plans = await SubRepository.findAllPlans();
    // map to DTO
    return (plans || []).map(p => ({
      planId: p.planId,
      name: p.name,
      price: p.price,
      durations: p.durations,
      description: p.description
    }));
  }

  static async getUserSubscriptions(userId) {
    const subs = await SubRepository.findByUserId(userId);
    return subs || [];
  }

  static async getUserCurrentSubscription(userId) {
    const current = await SubRepository.getUserCurrentSub(userId);
    return current || null;
  }
}

module.exports = SubService;
