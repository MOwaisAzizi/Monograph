import Offer from "../models/offerModel.js";
import Order from "../models/orderModel.js";
import Item from "../models/itemModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

const getOfferTargetUser = (offer, userId) => {
  if (offer.buyer && offer.buyer.toString() === userId.toString()) return "buyer";
  if (offer.seller && offer.seller.toString() === userId.toString()) return "seller";
  return null;
};

export const createOffer = catchAsync(async (req, res, next) => {
  const { itemId, price, note, isDirectBuy } = req.body;

  if (!itemId) {
    return next(new AppError("Item is required.", 400));
  }

  const item = await Item.findById(itemId).populate("shop", "owner");
  if (!item) {
    return next(new AppError("Item not found.", 404));
  }

  const sellerId = item.shop?.owner || item.owner;
  // if (!sellerId) {
  //   return next(new AppError("This item has no seller assigned.", 400));
  // }

  // if (sellerId.toString() === req.user._id.toString()) {
  //   return next(new AppError("You cannot make an offer on your own item.", 400));
  // }

  const acceptedPrice = Number(price ?? item.price ?? 0);
  if (!Number.isFinite(acceptedPrice) || acceptedPrice <= 0) {
    return next(new AppError("A valid offer price is required.", 400));
  }

  const offer = await Offer.create({
    item: itemId,
    buyer: req.user._id,
    seller: sellerId,
    price: item.price ?? acceptedPrice,
    proposedPrice: acceptedPrice,
    isDirectBuy: Boolean(isDirectBuy),
    note: note || "",
    status: "pending",
  });

  res.status(201).json({
    status: "success",
    data: { offer },
  });
});

export const getOfferById = catchAsync(async (req, res, next) => {
  const offer = await Offer.findById(req.params.id)
    .populate("item", "translation price media shop")
    .populate("buyer", "fullname")
    .populate("seller", "fullname");

  if (!offer) {
    return next(new AppError("Offer not found.", 404));
  }

  if (
    offer.buyer.toString() !== req.user._id.toString() &&
    offer.seller.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("You are not allowed to view this offer.", 403));
  }

  res.status(200).json({
    status: "success",
    data: { offer },
  });
});

export const listOffers = catchAsync(async (req, res) => {
  const query =
    req.user.role === "admin"
      ? {}
      : { $or: [{ buyer: req.user._id }, { seller: req.user._id }] };

  const offers = await Offer.find(query)
    .populate("item", "translation price media")
    .populate("buyer", "fullname")
    .populate("seller", "fullname")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: { offers },
  });
});

export const respondToOffer = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { action, price, note, location } = req.body;
  const offer = await Offer.findById(id);

  if (!offer) {
    return next(new AppError("Offer not found.", 404));
  }

  const actor = getOfferTargetUser(offer, req.user._id);
  if (!actor) {
    return next(
      new AppError("You are not allowed to respond to this offer.", 403),
    );
  }

  if (offer.status !== "pending") {
    return next(new AppError("Only pending offers can be updated.", 400));
  }

  if (action === "accept") {
    offer.status = "accepted";
    offer.note = note || offer.note || "";
  } else if (action === "reject") {
    offer.status = "rejected";
    offer.note = note || offer.note || "";
  } else if (action === "counter") {
    if (!price || Number(price) <= 0) {
      return next(new AppError("A valid counter price is required.", 400));
    }
    offer.status = "countered";
    offer.proposedPrice = Number(price);
    offer.note = note || "";
  } else {
    return next(new AppError("Unsupported offer action.", 400));
  }

  await offer.save();

  res.status(200).json({
    status: "success",
    data: { offer },
  });
});

export const proposeLocation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { label, latitude, longitude } = req.body;
  const offer = await Offer.findById(id);

  if (!offer) {
    return next(new AppError("Offer not found.", 404));
  }

  if (offer.status !== "accepted") {
    return next(
      new AppError(
        "Only accepted offers can have a meetup location proposed.",
        400,
      ),
    );
  }

  const actor = getOfferTargetUser(offer, req.user._id);
  if (!actor) {
    return next(new AppError("You are not allowed to manage this offer.", 403));
  }

  if (!label || !String(label).trim()) {
    return next(new AppError("Location label is required.", 400));
  }

  offer.location = {
    label: String(label).trim(),
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    proposedBy: req.user._id,
    confirmedBy: null,
  };

  await offer.save();

  res.status(200).json({
    status: "success",
    data: { offer },
  });
});

export const confirmLocation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const offer = await Offer.findById(id);

  if (!offer) {
    return next(new AppError("Offer not found.", 404));
  }

  if (offer.status !== "accepted") {
    return next(new AppError("Only accepted offers can be confirmed.", 400));
  }

  const actor = getOfferTargetUser(offer, req.user._id);
  if (!actor) {
    return next(
      new AppError("You are not allowed to confirm this offer.", 403),
    );
  }

  if (!offer.location?.label) {
    return next(new AppError("No agreed location exists yet.", 400));
  }

  if (offer.location.proposedBy?.toString() === req.user._id.toString()) {
    return next(
      new AppError("The proposer cannot self-confirm the location.", 400),
    );
  }

  offer.status = "confirmed";
  offer.location.confirmedBy = req.user._id;

  const existingOrder = await Order.findOne({ offer: offer._id });
  if (!existingOrder) {
    const order = await Order.create({
      offer: offer._id,
      item: offer.item,
      buyer: offer.buyer,
      seller: offer.seller,
      agreedPrice: offer.proposedPrice ?? offer.price,
      location: {
        label: offer.location.label,
        latitude: offer.location.latitude ?? null,
        longitude: offer.location.longitude ?? null,
      },
      status: "pending",
    });

    offer.order = order._id;
    await offer.save();
  }

  res.status(200).json({
    status: "success",
    data: { offer },
  });
});
