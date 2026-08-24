import mongoose from "mongoose";
import mediaSchema from "./mediaSchema.js";
import locationSchema from "./locationSchema.js";
import bcrypt from "bcrypt";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    phone: [String],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    preferredLanguage: {
      type: String,
      enum: ["en", "fa", "ps"],
      default: "en",
    },
    favoriteItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "Item",
      },
    ],
    favoriteShops: [
      {
        type: Schema.Types.ObjectId,
        ref: "Shop",
      },
    ],

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // hide from query results
    },

    media: mediaSchema,
    location: {
          address: {type: String},
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
          },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
