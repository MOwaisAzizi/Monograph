import mongoose from "mongoose";

const { Schema } = mongoose;

const meetingPlaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, lowercase: true, index: true },
    address: { type: String, default: "", trim: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

meetingPlaceSchema.index({ city: 1, name: 1 }, { unique: true });

export default mongoose.model("MeetingPlace", meetingPlaceSchema);
