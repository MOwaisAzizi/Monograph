import { Schema } from 'mongoose';
export const singleField = new Schema(
  {
    en: { type: String },
    fa: { type: String },
    ps: { type: String },
  },
  { _id: false },
);

export const multipleFields = new Schema(
  {
    en: {
      title: { type: String, required: [true, 'Field title is required'] },
      description: String,
    },
    fa: {
      title: { type: String, required: [true, 'Field title is required'] },
      description: String,
    },
    ps: {
      title: { type: String, required: [true, 'Field title is required'] },
      description: String,
    },
  },
  { _id: false },
);
