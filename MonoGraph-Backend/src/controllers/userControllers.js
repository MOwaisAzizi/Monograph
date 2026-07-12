
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { hashPassword, isCorrectPassword } from "../utils/auth.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

const sendTokens = (user) => {
  const payload = { id: user._id, role: user.role };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { accessToken, refreshToken };
};

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError("Email already in use", 400));

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const tokens = sendTokens(user);

  res.status(201).json({
    status: "success",
    ...tokens,
    data: { user },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Please provide email and password", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await isCorrectPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const tokens = sendTokens(user);

  res.status(200).json({
    status: "success",
    ...tokens,
    data: { user },
  });
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError("Refresh token required", 400));
  }

  const decoded = verifyRefreshToken(refreshToken);

  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError("User not found", 404));

  const accessToken = signAccessToken({ id: user._id, role: user.role });

  res.status(200).json({
    status: "success",
    accessToken,
  });
});

export const getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const updatedFields = {
    name: req.body.name,
    lastName: req.body.lastName,
    phone: req.body.phone,
    media: req.body.media,
    location: req.body.location,
  };

  const user = await User.findByIdAndUpdate(req.user.id, updatedFields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: { user },
  });
});
