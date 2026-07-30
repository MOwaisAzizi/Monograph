import mongoose, { Schema } from 'mongoose';
import locationSchema from './locationSchema.js';
import mediaSchema from './mediaSchema.js';
import { multipleFields } from './translationSchema.js';
import workingHoursSchema from './workingHoursModel.js';

const shopSchema = new Schema(
  {
    translation: { type: multipleFields, required: true },
    location: locationSchema,
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    city: { type: String, default: 'herat' },
    workingHours: [workingHoursSchema],
    media: [mediaSchema],
    social: { type: Map, of: String },
    shopType: {
      type: String,
      enum: ['restaurant', 'cafe', 'bakery', 'fast_food', 'clothing_store', 'shoe_store', 'electronics_store', 'mobile_store', 'supermarket', 'pharmacy', 'cosmetics_store', 'furniture_store', 'bookstore', 'beauty_salon', 'barbershop', 'repair_shop', 'car_wash', 'car_dealer', 'car_rental', 'mechanic', 'hotel', 'guest_house', 'clinic', 'gym'],
      default: 'restaurant',
    },
    phone: [String],
    email: { type: String, lowercase: true, trim: true },
    status: { type: String, enum: ['pending', 'under_review', 'closed', 'confirmed'], default: 'under_review' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    owner: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

const Shop = mongoose.model('Shop', shopSchema, 'businesses');
export default Shop;
