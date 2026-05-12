import express from "express";
import {
  createSubscription,
  verifyPayment,
  cancelSubscription,
  getBillingHistory,
  razorpayWebhook,
} from "../controllers/paymentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-subscription", authMiddleware, createSubscription);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.post("/cancel-subscription", authMiddleware, cancelSubscription);
router.get("/billing-history", authMiddleware, getBillingHistory);
router.post("/webhook", razorpayWebhook);

export default router;
