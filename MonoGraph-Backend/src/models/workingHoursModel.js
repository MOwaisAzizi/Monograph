import { Schema } from 'mongoose';

const timeRange = {
  open: { type: String },
  close: { type: String },
};

const workingHoursSchema = new Schema(
  {
    day: {
      type: String,
      required: true,
    },
    times: {
      type: [timeRange],
    },
  },
  { _id: false },
);

export default workingHoursSchema;
