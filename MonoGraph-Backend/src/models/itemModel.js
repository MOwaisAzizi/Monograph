import mongoose from "mongoose";
import { multipleFields } from "./translationSchema.js";
import locationSchema from "./locationSchema.js";
import mediaSchema from "./mediaSchema.js";

const itemSchema = new mongoose.Schema(
    {
        translation: multipleFields,
        location: locationSchema,
    attributes: [
  {
    key: {
      type: String,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    }
  }
],
        price: {
            type: Number,
        },
        media: [mediaSchema],
        city: { type: String, default: "herat" },
        rating: { type: Number, min: 0, max: 5, default: 0 },
        ratingCount: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },

        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        note: {
            type: String,
            minlength: 1,
            maxlength: 500,
        },
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    },
    { timestamps: true },
);

const Item = mongoose.model("Item", itemSchema);

export default Item;