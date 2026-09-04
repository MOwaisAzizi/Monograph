import mongoose from "mongoose";
import locationSchema from "./locationSchema.js";

const { Schema } = mongoose;

const meetingPlaceSchema = new Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    location: {
      type: locationSchema,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("MeetingPlace", meetingPlaceSchema);