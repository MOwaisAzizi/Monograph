import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    reviewType: {
      type: String,
      enum: ['Shop', 'Item'],
      required: true,
    },

    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'reviewType',
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
  }
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
  }
);


export default mongoose.model('Review', reviewSchema);
