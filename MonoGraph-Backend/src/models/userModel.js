import mongoose from "mongoose";
import mediaSchema from "./mediaSchema.js";
import locationSchema from "./locationSchema.js";
import bcrypt from "bcrypt"
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    phone: [String],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // hide from query results
    },

    media: mediaSchema,
    location: locationSchema,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
