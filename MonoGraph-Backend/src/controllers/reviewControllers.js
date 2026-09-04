import mongoose from "mongoose";
import Review from "../models/reviewModel.js";
import Shop from "../models/shopModel.js";
import Item from "../models/itemModel.js";
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

const refreshItemRating = async (itemId) => {
  const [summary] = await Review.aggregate([
    {
      $match: {
        reviewType: "Item",
        target: new mongoose.Types.ObjectId(itemId),
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
  await Item.findByIdAndUpdate(itemId, {
    rating: summary?.rating || 0,
    ratingsCount: summary?.ratingsCount || 0,
  });
};

const getReviewData = async (reviewType, targetId) => {
  const reviews = await Review.find({ reviewType, target: targetId })
    .populate("user", "fullname media")
    .sort("-createdAt");
  const stats = await Review.aggregate([
    {
      $match: {
        reviewType,
        target: new mongoose.Types.ObjectId(targetId),
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
  return { reviews, summary: { average, total, distribution } };
};

export const getShopReviews = catchAsync(async (req, res, next) => {
  const { shopId } = req.params;
  if (!mongoose.isValidObjectId(shopId))
    return next(new AppError("Invalid shop ID", 400));
  const { reviews, summary } = await getReviewData("Shop", shopId);
  res.json({
    status: "success",
    data: { reviews, summary },
  });
});

export const getItemReviews = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  if (!mongoose.isValidObjectId(itemId)) {
    return next(new AppError("Invalid item ID", 400));
  }
  if (!await Item.exists({ _id: itemId })) {
    return next(new AppError("Item not found", 404));
  }
  const data = await getReviewData("Item", itemId);
  res.json({ status: "success", data });
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

export const createOrUpdateItemReview = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const { rating, comment } = req.body;
  if (!mongoose.isValidObjectId(itemId)) {
    return next(new AppError("Invalid item ID", 400));
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment?.trim()) {
    return next(new AppError("Rating (1-5) and comment are required", 400));
  }
  if (!await Item.exists({ _id: itemId })) {
    return next(new AppError("Item not found", 404));
  }
  const review = await Review.findOneAndUpdate(
    { user: req.user._id, reviewType: "Item", target: itemId },
    { rating, comment: comment.trim() },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  await refreshItemRating(itemId);
  res.status(200).json({ status: "success", data: { review } });
});

export const deleteItemReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOneAndDelete({
    user: req.user._id,
    reviewType: "Item",
    target: req.params.itemId,
  });
  if (!review) return next(new AppError("Review not found", 404));
  await refreshItemRating(req.params.itemId);
  res.status(204).send();
});
