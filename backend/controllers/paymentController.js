import { razorpay, verifyRazorpaySignature } from "../services/razorpayService.js";
import User from "../models/userModel.js";
import Payment from "../models/paymentModel.js";
import SubscriptionHistory from "../models/subscriptionHistoryModel.js";
import { plans } from "../config/plans.js";
import crypto from "crypto";

export const createSubscription = async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;
    const userId = req.user._id;

    if (!plans[planId]) {
      return res.status(400).json({ status: "fail", message: "Invalid plan selected." });
    }

    const user = await User.findById(userId);

    if (planId === "free") {
      const oldPlan = user.plan;
      const oldBillingCycle = user.billingCycle;

      if (user.razorpaySubscriptionId) {
        try {
            await razorpay.subscriptions.cancel(user.razorpaySubscriptionId);
        } catch(e) {
            console.log("Failed to cancel Razorpay subscription during downgrade", e);
        }
      }

      const storageLimit = plans.free.storageLimit;
      const uploadsBlocked = user.usedStorageInBytes > storageLimit;

      const updatedUser = await User.findByIdAndUpdate(userId, {
        plan: "free",
        billingCycle: "monthly",
        maxStorageInBytes: storageLimit,
        subscriptionStatus: "active",
        razorpaySubscriptionId: null,
        uploadsBlocked
      }, { new: true });

      await SubscriptionHistory.create({
        userId,
        oldPlan,
        newPlan: "free",
        oldBillingCycle,
        newBillingCycle: "monthly",
        actionType: "downgrade"
      });

      return res.status(200).json({ status: "success", message: "Switched to free plan successfully." });
    }

    const rzpPlanId = plans[planId].razorpayPlanId[billingCycle];

    if (!rzpPlanId) {
      return res.status(500).json({ status: "fail", message: "Razorpay plan ID not configured." });
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: rzpPlanId,
      customer_notify: 1,
      total_count: billingCycle === "yearly" ? 5 : 60,
    });

    res.status(200).json({
      status: "success",
      subscriptionId: subscription.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({ status: "fail", message: "Failed to create subscription." });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, planId, billingCycle } = req.body;
    const userId = req.user._id;

    const isValid = verifyRazorpaySignature(razorpay_subscription_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.status(400).json({ status: "fail", message: "Payment verification failed." });
    }

    const user = await User.findById(userId);

    if (user.razorpaySubscriptionId && user.razorpaySubscriptionId !== razorpay_subscription_id) {
       try {
           await razorpay.subscriptions.cancel(user.razorpaySubscriptionId);
       } catch (e) {
           console.log("Failed to cancel old subscription.", e);
       }
    }

    const oldPlan = user.plan;
    const oldBillingCycle = user.billingCycle;
    const newStorageLimit = plans[planId].storageLimit;
    const uploadsBlocked = user.usedStorageInBytes > newStorageLimit;
    
    let actionType = "upgrade";
    if (plans[oldPlan] && plans[oldPlan].storageLimit > newStorageLimit) {
        actionType = "downgrade";
    } else if (oldPlan === planId && oldBillingCycle !== billingCycle) {
        actionType = "cycle_change";
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        plan: planId,
        billingCycle: billingCycle,
        maxStorageInBytes: newStorageLimit,
        subscriptionStatus: "active",
        razorpaySubscriptionId: razorpay_subscription_id,
        subscriptionStartDate: new Date(),
        uploadsBlocked
      },
      { new: true }
    );

    const payment = await Payment.create({
      userId,
      plan: planId,
      billingCycle,
      amount: plans[planId].pricing[billingCycle],
      razorpayPaymentId: razorpay_payment_id,
      razorpaySubscriptionId: razorpay_subscription_id,
      status: "captured",
    });

    await SubscriptionHistory.create({
      userId,
      oldPlan,
      newPlan: planId,
      oldBillingCycle,
      newBillingCycle: billingCycle,
      actionType,
      paymentId: payment._id.toString()
    });

    res.status(200).json({
      status: "success",
      message: "Payment successful and plan activated.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ status: "fail", message: "Failed to verify payment." });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user.razorpaySubscriptionId) {
      return res.status(400).json({ status: "fail", message: "No active subscription found." });
    }

    try {
        await razorpay.subscriptions.cancel(user.razorpaySubscriptionId);
    } catch (e) {
        console.log("Error cancelling razorpay subscription", e);
    }

    const oldPlan = user.plan;
    const oldBillingCycle = user.billingCycle;
    const newStorageLimit = plans.free.storageLimit;
    const uploadsBlocked = user.usedStorageInBytes > newStorageLimit;

    user.plan = "free";
    user.billingCycle = "monthly";
    user.maxStorageInBytes = newStorageLimit;
    user.subscriptionStatus = "cancelled";
    user.razorpaySubscriptionId = null;
    user.uploadsBlocked = uploadsBlocked;
    await user.save();

    await SubscriptionHistory.create({
      userId,
      oldPlan,
      newPlan: "free",
      oldBillingCycle,
      newBillingCycle: "monthly",
      actionType: "cancel"
    });

    res.status(200).json({ status: "success", message: "Subscription cancelled successfully." });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ status: "fail", message: "Failed to cancel subscription." });
  }
};

export const getBillingHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    const history = await SubscriptionHistory.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ status: "success", data: payments, history });
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Failed to fetch billing history." });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = req.body;
    console.log("Webhook body:", body);
    
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).send("Invalid signature");
    }

    const event = body.event;
    const payload = body.payload;

    if (event === "subscription.charged") {
      const subscription = payload.subscription.entity;
      const payment = payload.payment.entity;

      const user = await User.findOne({ razorpaySubscriptionId: subscription.id });
      if (user) {
        const existingPayment = await Payment.findOne({ razorpayPaymentId: payment.id });
        if (!existingPayment) {
            await Payment.create({
            userId: user._id,
            plan: user.plan,
            billingCycle: user.billingCycle,
            amount: payment.amount / 100,
            razorpayPaymentId: payment.id,
            razorpaySubscriptionId: subscription.id,
            status: "captured",
            });
        }
      }
    } else if (event === "subscription.cancelled" || event === "subscription.halted") {
      const subscription = payload.subscription.entity;
      const user = await User.findOne({ razorpaySubscriptionId: subscription.id });
      if (user && user.plan !== 'free') {
        const oldPlan = user.plan;
        const oldBillingCycle = user.billingCycle;
        const newStorageLimit = plans.free.storageLimit;
        const uploadsBlocked = user.usedStorageInBytes > newStorageLimit;

        user.plan = "free";
        user.billingCycle = "monthly";
        user.maxStorageInBytes = newStorageLimit;
        user.subscriptionStatus = "cancelled";
        user.razorpaySubscriptionId = null;
        user.uploadsBlocked = uploadsBlocked;
        await user.save();

        await SubscriptionHistory.create({
            userId: user._id,
            oldPlan,
            newPlan: "free",
            oldBillingCycle,
            newBillingCycle: "monthly",
            actionType: "cancel"
        });
      }
    } else if (event === "subscription.activated") {
       const subscription = payload.subscription.entity;
       const user = await User.findOne({ razorpaySubscriptionId: subscription.id });
       if (user) {
          user.subscriptionStatus = "active";
          user.currentPeriodStart = new Date(subscription.current_start * 1000);
          user.currentPeriodEnd = new Date(subscription.current_end * 1000);
          await user.save();
       }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook error");
  }
};
