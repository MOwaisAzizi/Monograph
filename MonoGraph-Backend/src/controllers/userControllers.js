import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { isCorrectPassword } from "../utils/auth.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import Item from "../models/itemModel.js";
import Review from "../models/reviewModel.js";

const sendTokens = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    tokenVersion: user.tokenVersion || 0,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { accessToken, refreshToken };
};

export const signup = catchAsync(async (req, res, next) => {
  const { fullname, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError("Email already in use", 400));

  const user = await User.create({
    fullname,
    email,
    password,
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

  const user = await User.findOne({ email }).select("+password +tokenVersion");

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

  const user = await User.findById(decoded.id).select("+tokenVersion");
  if (!user) return next(new AppError("User not found", 404));
  if (user.tokenVersion !== decoded.tokenVersion)
    return next(new AppError("Refresh token is no longer valid", 401));

  const accessToken = signAccessToken({
    id: user._id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  res.status(200).json({
    status: "success",
    accessToken,
  });
});

export const logout = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
  res.status(204).send();
});
export const getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate("favoriteItems")
    .populate("favoriteShops");
  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

const parseJsonField = (value, fallback = value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const updateProfile = catchAsync(async (req, res, next) => {
  const media = parseJsonField(req.body.media, {});
  const location = parseJsonField(req.body.location);
  console.log("--------------------");
  // console.log(req.body);
  // console.log(...req.body.media);
  // console.log(...req.body.media);
  const email = req.body.email;
  if (email) {
    const existingUser = await User.findOne({
      email: String(email).toLowerCase(),
      _id: { $ne: req.user.id },
    });
    if (existingUser) return next(new AppError("Email already in use", 400));
  }
  const updatedFields = {};
  if (req.body.fullname !== undefined) updatedFields.fullname = req.body.fullname;
  if (req.body.phone !== undefined) updatedFields.phone = parseJsonField(req.body.phone, req.body.phone);
  if (req.body.media !== undefined) updatedFields.media = media;
  if (location?.geoPosition?.coordinates?.length === 2) updatedFields.location = location;

  const user = await User.findByIdAndUpdate(req.user.id, updatedFields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const toggleFavoriteItemOrShop = catchAsync(async (req, res, next) => {
  const { item, shop } = req.body;
  if (!item && !shop) {
    return next(new AppError("Either item or shop must be provided", 400));
  }
  if (item && shop) {
    return next(new AppError("Only one of item or shop can be provided", 400));
  }

  const favoriteField = item ? "favoriteItems" : "favoriteShops";
  const targetId = item || shop;

  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found", 404));

  const isAlreadyBookmarked = user[favoriteField].some(
    (id) => id.toString() === targetId,
  );

  if (isAlreadyBookmarked) {
    user[favoriteField] = user[favoriteField].filter(
      (id) => id.toString() !== targetId,
    );
    await user.save();
    return res.status(200).json({ message: "Removed from favorites!" });
  }

  user[favoriteField].push(targetId);
  await user.save();

  return res.status(200).json({ message: "Added to favorites!" });
});

export const getUserStats = catchAsync(async (req, res) => {
  console.log("User2 authenticated:");
  const userId = req.user._id;

  const [itemStats, ratingStats] = await Promise.all([
    Item.aggregate([
      {
        $match: {
          owner: userId,
        },
      },
      {
        $group: {
          _id: null,
          listed: { $sum: 1 },
          sold: {
            $sum: {
              $cond: [{ $eq: ["$status", "sold"] }, 1, 0],
            },
          },
        },
      },
    ]),

    Review.aggregate([
      {
        $match: {
          reviewType: "Item",
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "target",
          foreignField: "_id",
          as: "item",
        },
      },
      {
        $unwind: "$item",
      },
      {
        $match: {
          "item.owner": userId,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]),
  ]);

  const stats = {
    listed: itemStats[0]?.listed || 2,
    sold: itemStats[0]?.sold || 0,
    rating: Number((ratingStats[0]?.averageRating || 0).toFixed(1)),
  };
console.log('stats')
console.log(stats)
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});