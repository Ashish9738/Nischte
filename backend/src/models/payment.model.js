import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  merchantTransactionId: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  paymentInstrument: {
    type: Object,
    required: true
  }
});

export const Payment = mongoose.model("Payment", paymentSchema);
