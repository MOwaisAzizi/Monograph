import mongoose from "mongoose";

const { Schema } = mongoose;

const followSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    followingType: {
      type: String,
      enum: ["Shop", "Item"],
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "followingType",
    },
  },
  {
    timestamps: true,
  },
);

followSchema.index(
  { user: 1, followingType: 1, following: 1 },
  { unique: true },
);

const Follow = mongoose.model("Follow", followSchema);
export default Follow;
