import { razorpay, verifyRazorpaySignature } from "../services/razorpayService.js";
import User from "../models/userModel.js";
import Payment from "../models/paymentModel.js";
import { plans } from "../config/plans.js";
import crypto from "crypto";

export const createSubscription = async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;
    const userId = req.user._id;

    if (!plans[planId]) {
      return res.status(400).json({ status: "fail", message: "Invalid plan selected." });
    }

    if (planId === "free") {
      await User.findByIdAndUpdate(userId, {
        plan: "free",
        billingCycle: "monthly",
        maxStorageInBytes: plans.free.storageLimit,
        subscriptionStatus: "active",
        razorpaySubscriptionId: null,
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
      total_count: billingCycle === "yearly" ? 10 : 120,
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

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        plan: planId,
        billingCycle: billingCycle,
        maxStorageInBytes: plans[planId].storageLimit,
        subscriptionStatus: "active",
        razorpaySubscriptionId: razorpay_subscription_id,
        subscriptionStartDate: new Date(),
      },
      { new: true }
    );

    await Payment.create({
      userId,
      plan: planId,
      billingCycle,
      amount: plans[planId].pricing[billingCycle],
      razorpayPaymentId: razorpay_payment_id,
      razorpaySubscriptionId: razorpay_subscription_id,
      status: "captured",
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

    await razorpay.subscriptions.cancel(user.razorpaySubscriptionId);

    user.plan = "free";
    user.billingCycle = "monthly";
    user.maxStorageInBytes = plans.free.storageLimit;
    user.subscriptionStatus = "cancelled";
    user.razorpaySubscriptionId = null;
    await user.save();

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
    res.status(200).json({ status: "success", data: payments });
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Failed to fetch billing history." });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = req.body; 
    
    // Validate signature securely
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest("hex");

    // Depending on Express middleware, JSON.stringify might alter the exact raw string, 
    // but typically it works if body parser matches Razorpay's format exactly or if you capture raw body.
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
    } else if (event === "subscription.cancelled" || event === "subscription.halted") {
      const subscription = payload.subscription.entity;
      const user = await User.findOne({ razorpaySubscriptionId: subscription.id });
      if (user) {
        user.plan = "free";
        user.maxStorageInBytes = plans.free.storageLimit;
        user.subscriptionStatus = "cancelled";
        user.razorpaySubscriptionId = null;
        await user.save();
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook error");
  }
};
