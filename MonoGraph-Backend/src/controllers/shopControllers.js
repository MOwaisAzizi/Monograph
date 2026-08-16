import Shop from "../models/shopModel.js";
import Item from "../models/itemModel.js";
import Follow from "../models/followModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createShop = catchAsync(async (req, res) => {
  console.log("----------------🌯🌮");
  console.log(req.body);
  console.log("----------------🌯🌮");
  const shop = await Shop.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ status: "success", data: { shop } });
});

export const getShops = catchAsync(async (req, res) => {
  const filter = req.path === "/mine" ? { owner: req.user._id } : {};
  const shops = await Shop.find(filter);
  res
    .status(200)
    .json({ status: "success", results: shops.length, data: { shops } });
});

export const getShop = catchAsync(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) return next(new AppError("No shop found with that ID", 404));
  res.status(200).json({ status: "success", data: { shop } });
});

export const getShopItems = catchAsync(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) return next(new AppError("No shop found with that ID", 404));

  const items = await Item.find({ shop: shop._id })
    .populate("shop", "translation")
    .populate("category", "translation");

  res.status(200).json({
    status: "success",
    results: items.length,
    data: { items },
  });
});

export const getSimilarShops = catchAsync(async (req, res, next) => {
  const currentShop = await Shop.findById(req.params.id).select("category");
  if (!currentShop)
    return next(new AppError("No shop found with that ID", 404));

  const categoryFilter = { category: currentShop.category };
  const shops = await Shop.find({
    _id: { $ne: currentShop._id },
    ...categoryFilter,
  })
    .sort({ rating: -1, createdAt: -1 })
    .limit(10);

  res
    .status(200)
    .json({ status: "success", results: shops.length, data: { shops } });
});

export const updateShop = catchAsync(async (req, res, next) => {
  const shop = await Shop.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    req.body,
    { new: true, runValidators: true },
  );
  if (!shop)
    return next(new AppError("Shop not found or you do not own it", 404));
  res.status(200).json({ status: "success", data: { shop } });
});

export const deleteShop = catchAsync(async (req, res, next) => {
  const shop = await Shop.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!shop)
    return next(new AppError("Shop not found or you do not own it", 404));
  res.status(204).json({ status: "success", data: null });
});

export const toggleFollowShop = catchAsync(async (req, res, next) => {
  const shop = await Shop.findById(req.params.shopId);
  if (!shop) return next(new AppError("Shop not found", 404));
  const filter = {
    user: req.user._id,
    following: shop._id,
    followingType: "Shop",
  };
  const existingFollow = await Follow.findOne(filter);

  if (existingFollow) {
    await existingFollow.deleteOne();
    return res
      .status(200)
      .json({ status: "success", data: { following: false } });
  }
  await Follow.create(filter);
  res.status(201).json({ status: "success", data: { following: true } });
});
