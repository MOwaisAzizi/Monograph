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
    askingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    offeredPrice: {
      type: Number,
      default: null,
    },
    note: {
      type: String,
      default: "",
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    offerLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MeetingPlace",
      default: null,
    },
  },
  { timestamps: true },
);

offerSchema.index({ item: 1, buyer: 1, seller: 1, createdAt: -1 });

export default mongoose.model("Offer", offerSchema);
