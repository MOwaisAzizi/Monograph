import { Schema } from 'mongoose';
export const singleField = new Schema(
  {
en: {
      title: { type: String, required: [true, 'Field title is required'] },
    },
    fa: {
      title: { type: String, required: [true, 'Field title is required'] },
    },
    ps: {
      title: { type: String, required: [true, 'Field title is required'] },
    },
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
