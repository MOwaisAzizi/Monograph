import { Schema } from "mongoose";

const mediaSchema = new Schema({
  type: {
    type: String,
    enum: {
      values: ['gallery', 'cover', 'profile'],
      message: 'Invalid media type',
    },
    default: 'gallery',
  },
  url: {
    type: Object,
    required: true,
  }
});

export default mediaSchema;
