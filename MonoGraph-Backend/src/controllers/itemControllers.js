import Item from "../models/itemModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Shop from "../models/shopModel.js";

export const createItem = catchAsync(async (req, res, next) => {
  if (!req.body.shop) {
    return next(new AppError("Shop is required to create an item", 400));
  }

  const shop = await Shop.findById(req.body.shop);
  if (!shop) {
    return next(new AppError("No shop found with that ID", 404));
  }

  if (!shop.owner || shop.owner.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only add items to your own shop", 403));
  }

  const itemDoc = await Item.create({
    ...req.body,
    owner: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: { item: itemDoc },
  });
});

export const getAllItems = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.query.shop) filter.shop = req.query.shop;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.type) filter.type = req.query.type;

  const Items = await Item.find(filter)
    .populate("shop", "translation")
    .populate("category", "translation");

  res.status(200).json({
    status: "success",
    results: Items.length,
    data: { Items },
  });
});

export const getItem = catchAsync(async (req, res, next) => {
  const itemDoc = await Item.findById(req.params.id)
    .populate("shop", "translation")
    .populate("category", "translation");

  if (!itemDoc) {
    return next(new AppError("No item found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { itemDoc },
  });
});

export const updateItem = catchAsync(async (req, res, next) => {
  const itemDoc = await Item.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!itemDoc) {
    return next(new AppError("No item found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { itemDoc },
  });
});

export const deleteItem = catchAsync(async (req, res, next) => {
  const itemDoc = await Item.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!itemDoc) {
    return next(new AppError("No item found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
