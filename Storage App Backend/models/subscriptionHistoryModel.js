import mongoose from "mongoose";

const subscriptionHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    oldPlan: { type: String, enum: ["free", "basic", "pro"], required: true },
    newPlan: { type: String, enum: ["free", "basic", "pro"], required: true },
    oldBillingCycle: { type: String, enum: ["monthly", "yearly"] },
    newBillingCycle: { type: String, enum: ["monthly", "yearly"] },
    actionType: { type: String, enum: ["upgrade", "downgrade", "cycle_change", "cancel"], required: true },
    paymentId: { type: String }, // Optional
  },
  { timestamps: true }
);

const SubscriptionHistory = mongoose.model("SubscriptionHistory", subscriptionHistorySchema);
export default SubscriptionHistory;
