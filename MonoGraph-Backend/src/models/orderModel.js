import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    offer: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      // default: null,
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
    orderLocation: {
      type: Schema.Types.ObjectId,
      ref: "MeetingPlace",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    meetupDate: { type: Date, default: null },
    meetupLocationId: {
      type: Schema.Types.ObjectId,
      ref: "MeetingPlace",
      default: null,
    },
    meetupStatus: {
      type: String,
      enum: [
        "pending_seller",
        "pending_buyer_confirmation",
        "confirmed",
        "change_requested",
      ],
      default: "pending_seller",
    },
    changeRequestReason: { type: String, default: "" },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
