import { Schema } from "mongoose";

const mediaSchema = new Schema(
  {
    type: {
      type: String,
      enum: {
        values: ["cover", "profile"],
        message: "Invalid media type",
      },
      default: "gallery",
    },
    url: { type: String, required: true },
  },
  { _id: false, timestamps: true },
);

export default mediaSchema;
