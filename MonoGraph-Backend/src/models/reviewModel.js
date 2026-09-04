import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewType: {
      type: String,
      enum: ["Shop", "Item"],
      required: true,
    },

    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// prevent duplicate reviews
reviewSchema.index(
  {
    user: 1,
    reviewType: 1,
    target: 1,
  },
  {
    unique: true,
  },
);

reviewSchema.index({ reviewType: 1, target: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
