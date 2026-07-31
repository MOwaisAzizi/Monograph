import { Schema } from "mongoose";

const workingHoursSchema = new Schema(
  {
    day: {
      type: String,
      required: true,
    },
    open: { type: String, default: null },
    close: { type: String, default: null },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false, timestamps: true },
);

export default workingHoursSchema;
