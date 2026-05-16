import { hasFeature } from '../utils/planFeatures.js';

export const requireFeature = (feature) => {
  return (req, res, next) => {
    const userPlan = req.user?.plan || 'free';
    if (!hasFeature(userPlan, feature)) {
      return res.status(403).json({
        success: false,
        error: "Premium Feature",
        message: `This feature requires a premium plan. Please upgrade.`
      });
    }
    next();
  };
};

export const requirePlan = (plans) => {
  return (req, res, next) => {
    const userPlan = req.user?.plan || 'free';
    if (!plans.map(p => p.toLowerCase()).includes(userPlan.toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: "Plan Restriction",
        message: `This feature is not available on your current plan.`
      });
    }
    next();
  };
};
