export const plans = {
  free: {
    id: "free",
    name: "Free Plan",
    storageLimit: 1 * 1024 * 1024 * 1024, // 1GB
    pricing: {
      monthly: 0,
      yearly: 0,
    },
  },
  basic: {
    id: "basic",
    name: "Basic",
    storageLimit: 100 * 1024 * 1024 * 1024, // 100GB
    pricing: {
      monthly: 99,
      yearly: 1099,
    },
    razorpayPlanId: {
      monthly: process.env.RAZORPAY_PLAN_BASIC_MONTHLY,
      yearly: process.env.RAZORPAY_PLAN_BASIC_YEARLY,
    }
  },
  pro: {
    id: "pro",
    name: "Pro",
    storageLimit: 512 * 1024 * 1024 * 1024, // 512GB
    pricing: {
      monthly: 299,
      yearly: 3449,
    },
    razorpayPlanId: {
      monthly: process.env.RAZORPAY_PLAN_PRO_MONTHLY,
      yearly: process.env.RAZORPAY_PLAN_PRO_YEARLY,
    }
  },
};

export const getPlanLimits = (planId) => {
  return plans[planId]?.storageLimit || plans.free.storageLimit;
};
