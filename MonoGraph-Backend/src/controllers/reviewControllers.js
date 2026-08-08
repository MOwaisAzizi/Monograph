import mongoose from "mongoose";
import Review from "../models/reviewModel.js";
import Shop from "../models/shopModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

const refreshShopRating = async (shopId) => {
  const [summary] = await Review.aggregate([
    {
      $match: {
        reviewType: "Shop",
        target: new mongoose.Types.ObjectId(shopId),
      },
    },
    {
      $group: {
        _id: null,
        rating: { $avg: "$rating" },
        ratingsCount: { $sum: 1 },
      },
    },
  ]);
  await Shop.findByIdAndUpdate(shopId, {
    rating: summary?.rating || 0,
    ratingsCount: summary?.ratingsCount || 0,
  });
};

export const getShopReviews = catchAsync(async (req, res, next) => {
  const { shopId } = req.params;
  if (!mongoose.isValidObjectId(shopId))
    return next(new AppError("Invalid shop ID", 400));
  const reviews = await Review.find({ reviewType: "Shop", target: shopId })
    .populate("user", "fullname media")
    .sort("-createdAt");
  const stats = await Review.aggregate([
    {
      $match: {
        reviewType: "Shop",
        target: new mongoose.Types.ObjectId(shopId),
      },
    },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
  ]);
  const distribution = Object.fromEntries(
    [1, 2, 3, 4, 5].map((rating) => [rating, 0]),
  );
  stats.forEach(({ _id, count }) => {
    distribution[_id] = count;
  });
  const total = reviews.length;
  const average = total
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / total
    : 0;
  res.json({
    status: "success",
    data: { reviews, summary: { average, total, distribution } },
  });
});

export const createOrUpdateShopReview = catchAsync(async (req, res, next) => {
  const { shopId } = req.params;
  const { rating, comment } = req.body;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment?.trim())
    return next(new AppError("Rating (1-5) and comment are required", 400));
  const shop = await Shop.findById(shopId);
  if (!shop) return next(new AppError("Shop not found", 404));
  const review = await Review.findOneAndUpdate(
    { user: req.user._id, reviewType: "Shop", target: shopId },
    { rating, comment: comment.trim() },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  await refreshShopRating(shopId);
  res.status(200).json({ status: "success", data: { review } });
});

export const deleteShopReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOneAndDelete({
    user: req.user._id,
    reviewType: "Shop",
    target: req.params.shopId,
  });
  if (!review) return next(new AppError("Review not found", 404));
  await refreshShopRating(req.params.shopId);
  res.status(204).send();
});
