import Item from "../models/itemModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Shop from "../models/shopModel.js";
import { createOrder } from "../services/orderService.js";

export const createItem = catchAsync(async (req, res, next) => {
  // if (!req.body.shop) {
  //   return next(new AppError("Shop is required to create an item", 400));
  // }
  console.log("-------------------------------------🌮🥪🥪🥪🥙");
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

  if (req.path === "/mine") filter.owner = req.user._id;

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
    data: { item: itemDoc },
  });
});

export const buyItem = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("shop", "owner");

  if (!item) {
    return next(new AppError("No item found with that ID", 404));
  }

  const sellerId = item.shop?.owner || item.owner;
  const subtotal = Number(item.price ?? 0);
  const location = req.body?.location || {};

  // if (!sellerId) {
  //   return next(new AppError("Item seller is not configured", 400));
  // }

  // if (!location.label) {
  //   return next(new AppError("Location label is required.", 400));
  // }

  const order = await createOrder({
    itemId: item._id,
    buyerId: req.user._id,
    sellerId,
    subtotal,
    total: subtotal,
    location,
    initialStatus: "pending",
  });

  res.status(201).json({
    status: "success",
    data: { order },
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

export const similarItems = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  console.log("🥙🥗");
  console.log(id);
  const currentItem = await Item.findById(id).select("category shop price");
  if (!currentItem) {
    throw new Error("Item not found");
  }
  console.log("🥙🥗");
  console.log("🥙🥗");
  // console.log(currectItem)
  console.log("🥙🥗");
  const similar = await Item.find({
    _id: { $ne: id },
    category: currentItem.category,
  })
    .sort({ rating: -1, createdAt: -1 })
    .limit(10)
    .populate("shop", "translation")
    .populate("category", "translation")
    .lean();
  console.log("similar");
  console.log(similar);
  res.status(200).json({
    status: "success",
    data: similar,
  });
});
