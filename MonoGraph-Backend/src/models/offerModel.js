import mongoose from "mongoose";

const { Schema } = mongoose;

const offerSchema = new Schema(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    proposedPrice: {
      type: Number,
      default: null,
    },
    isDirectBuy: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      default: "",
      maxlength: 500,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "countered",
        "cancelled",
        "confirmed",
      ],
      default: "pending",
    },
    location: {
      label: { type: String, default: "" },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      proposedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      confirmedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true },
);

offerSchema.index({ item: 1, buyer: 1, seller: 1, createdAt: -1 });

export default mongoose.model("Offer", offerSchema);
