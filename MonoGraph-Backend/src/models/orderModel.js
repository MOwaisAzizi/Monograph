import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    offer: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      default: null,
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      // required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      label: { type: String, required: true },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

orderSchema.index(
  { offer: 1 },
  {
    unique: true,
    partialFilterExpression: { offer: { $type: "objectId" } },
  },
);

export default mongoose.model("Order", orderSchema);
