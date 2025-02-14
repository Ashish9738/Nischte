import mongoose, { Schema, model } from "mongoose";

const AppliedOfferSchema = new Schema({
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    required: false,
  },
  offerName: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  discountRate: {
    type: Number,
    required: false,
  },
  discountRate: {
    type: Number,
    required: false,
  },
  plusOffer: {
    type: Number,
    required: false,
  },
});

const CartItemSchema = new Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  finalPrice: {
    type: Number,
    required: true,
  },
  savings: {
    type: Number,
    default: 0,
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  appliedOffer: {
    type: AppliedOfferSchema,
    default: null,
  },
});

const CartSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    cartTotal: {
      type: Number,
      required: true,
    },
    totalItems: {
      type: Number,
      required: true,
    },
    originalQuantity: {
      type: Number,
      required: true,
    },
    totalSavings: {
      type: Number,
      default: 0,
    },
    items: {
      type: [CartItemSchema],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    }, 
    status: {
      type: String,
      default: "pending"
    }
  },
  { timestamps: true }
);

export const Order = model("Order", CartSchema);
