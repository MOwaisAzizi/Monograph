import { Schema } from "mongoose";
import { singleField } from "./translationSchema.js";

const locationSchema = new Schema(
  {
    address: singleField,
    geoPosition: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  { _id: false, timestamps: true },
);

locationSchema.index({ "geoPosition.coordinates": "2dsphere" });

export default locationSchema;
