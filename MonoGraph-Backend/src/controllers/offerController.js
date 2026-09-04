import Offer from "../models/offerModel.js";
import Item from "../models/itemModel.js";
import MeetingPlace from "../models/meetingPlaceModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { createOrder } from "../services/orderService.js";

const getOfferTargetUser = (offer, userId) => {
  if (offer.buyer && offer.buyer.toString() === userId.toString()) {
    return "buyer";
  }

  if (offer.seller && offer.seller.toString() === userId.toString()) {
    return "seller";
  }

  return null;
};

export const createOffer = catchAsync(async (req, res, next) => {
  const {
    itemId,
    askingPrice,
    offeredPrice,
    note,
    offerLocation = null,
  } = req.body;

  if (!itemId) {
    return next(new AppError("Item is required.", 400));
  }

  const item = await Item.findById(itemId).populate("shop", "owner");

  if (!item) {
    return next(new AppError("Item not found.", 404));
  }

  const sellerId = item.shop?.owner || item.owner;

  const finalAskingPrice = Number(
    askingPrice ?? item.price ?? 0,
  );

  if (
    !Number.isFinite(finalAskingPrice) ||
    finalAskingPrice <= 0
  ) {
    return next(new AppError("A valid asking price is required.", 400));
  }

  if (offerLocation && !await MeetingPlace.exists({ _id: offerLocation, active: true })) {
    return next(new AppError("Meeting place not found.", 400));
  }

  const finalOfferedPrice =
    offeredPrice !== undefined && offeredPrice !== null
      ? Number(offeredPrice)
      : null;

  if (
    finalOfferedPrice !== null &&
    (!Number.isFinite(finalOfferedPrice) || finalOfferedPrice <= 0)
  ) {
    return next(new AppError("A valid offered price is required.", 400));
  }

  const offer = await Offer.create({
    item: itemId,
    buyer: req.user._id,
    seller: sellerId,
    askingPrice: finalAskingPrice,
    offeredPrice: finalOfferedPrice,
    note: note || "",
    status: "pending",
    offerLocation,
  });
  await offer.populate("offerLocation");

  res.status(201).json({
    status: "success",
    data: { offer },
  });
});

export const getOfferById = catchAsync(async (req, res, next) => {
  const offer = await Offer.findById(req.params.id)
    .populate("item", "translation price media shop")
    .populate("buyer", "fullname")
    .populate("seller", "fullname")
    .populate("offerLocation");

  if (!offer) {
    return next(new AppError("Offer not found.", 404));
  }

  if (
    offer.buyer.toString() !== req.user._id.toString() &&
    offer.seller?.toString() !== req.user._id.toString()
  ) {
    return next(
      new AppError("You are not allowed to view this offer.", 403),
    );
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
      : {
        $or: [
          { buyer: req.user._id },
          { seller: req.user._id },
        ],
      };

  const offers = await Offer.find(query)
    .populate("item", "translation price media")
    .populate("buyer", "fullname")
    .populate("seller", "fullname")
    .populate("offerLocation")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: { offers },
  });
});

export const respondToOffer = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { action, offeredPrice, note } = req.body;
  console.log('-------------------------------------------🥗🥗🥗🥗')
  console.log(action, offeredPrice, note)
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
    return next(
      new AppError("Only pending offers can be updated.", 400),
    );
  }

  if (action === "reject" && actor !== "seller") {
    return next(new AppError("Only the seller can reject this offer.", 403));
  }

  if (action === "confirmed") {
    return next(new AppError("Use the offer accept endpoint to accept an offer.", 400));
  } else if (action === "reject") {
    offer.status = "cancelled";

    if (note) {
      offer.note = note;
    }
  } else if (action === "counter") {
    const parsedPrice = Number(offeredPrice);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return next(
        new AppError("A valid offered price is required.", 400),
      );
    }

    offer.offeredPrice = parsedPrice;

    // Keep it pending because "countered" no longer exists
    // in the final Offer status enum.
    offer.status = "pending";

    if (note) {
      offer.note = note;
    }
  } else {
    offer.status = "confirmed";
  }

  await offer.save();

  res.status(200).json({
    status: "success",
    data: { offer },
  });
});

export const proposeLocation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { offerLocation } = req.body;

  const offer = await Offer.findById(id);

  if (!offer) {
    return next(new AppError("Offer not found.", 404));
  }

  if (offer.status !== "confirmed") {
    return next(
      new AppError(
        "Only accepted offers can have a meetup location proposed.",
        400,
      ),
    );
  }

  const actor = getOfferTargetUser(offer, req.user._id);

  if (!actor) {
    return next(
      new AppError("You are not allowed to manage this offer.", 403),
    );
  }

  const meetingPlace = await MeetingPlace.findOne({ _id: offerLocation, active: true });
  if (!meetingPlace) {
    return next(new AppError("Meeting place not found.", 400));
  }

  offer.offerLocation = meetingPlace._id;

  await offer.save();
  await offer.populate("offerLocation");

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

  if (offer.status !== "completed") {
    return next(
      new AppError(
        "Only completed offers can be accepted.",
        400,
      ),
    );
  }

  const actor = getOfferTargetUser(offer, req.user._id);

  if (!actor) {
    return next(
      new AppError("You are not allowed to confirm this offer.", 403),
    );
  }

  if (!offer.offerLocation) {
    return next(
      new AppError("No agreed location exists yet.", 400),
    );
  }

  res.status(200).json({
    status: "success",
    data: { offer },
  });
});

export const acceptOffer = catchAsync(async (req, res, next) => {
  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    return next(new AppError("Offer not found.", 404));
  }

  if (!offer.seller) {
    return next(new AppError("Offer seller is not configured.", 400));
  }

  if (offer.seller.toString() !== req.user._id.toString()) {
    return next(new AppError("You are not allowed to accept this offer.", 403));
  }

  const subtotal = offer.offeredPrice ?? offer.askingPrice;
  const orderLocation = req.body?.orderLocation || offer.offerLocation || null;

  if (orderLocation && !await MeetingPlace.exists({ _id: orderLocation, active: true })) {
    return next(new AppError("Meeting place not found.", 400));
  }

  const order = await createOrder({
    itemId: offer.item,
    buyerId: offer.buyer,
    sellerId: offer.seller,
    subtotal,
    total: subtotal,
    orderLocation,
    offerId: offer._id,
    initialStatus: "pending",
  });
  await offer.populate("offerLocation");

  res.status(201).json({
    status: "success",
    data: { offer: await Offer.findById(offer._id), order },
  });
});

export const cancelOffer = catchAsync(async (req, res, next) => {
  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    return next(new AppError("Offer not found.", 404));
  }

  // Only the buyer who created the offer can cancel it
  if (offer.buyer.toString() !== req.user._id.toString()) {
    return next(
      new AppError("Only the buyer can cancel this offer.", 403)
    );
  }

  if (offer.status !== "pending") {
    return next(
      new AppError("Only pending offers can be cancelled.", 400)
    );
  }

  offer.status = "cancelled";

  await offer.save();

  res.status(200).json({
    status: "success",
    data: { offer },
  });
});
