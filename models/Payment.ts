import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    planId: { type: String, required: true },
    paymentId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);