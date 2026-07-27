import mongoose, { Schema } from "mongoose";
import { singleField } from "./translationSchema.js";

const CategorySchema = new Schema(
    {
        translation: singleField,
        icon: { type: String, default: null },
    },
    { timestamps: true }
)

const Category = new mongoose.model("Category", CategorySchema);
export default Category;
