import Order from "../models/orderModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { createOrder, cancelOrder as cancelOrderTransaction } from "../services/orderService.js";
import Item from "../models/itemModel.js";
import MeetingPlace from "../models/meetingPlaceModel.js";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";

const canAccessOrder = (order, userId) =>
  order.buyer.toString() === userId.toString() ||
  order.seller.toString() === userId.toString();

const addOrderSystemMessage = async (order, sender, content) => {
  const participants = [String(order.buyer), String(order.seller)].sort();
  let conversation = await Conversation.findOne({
    item: order.item,
    participants: { $all: participants },
  });
  if (!conversation) {
    conversation = await Conversation.create({ item: order.item, participants });
  }
  await Message.create({ conversation: conversation._id, sender, content, type: "system" });
  conversation.lastMessageAt = new Date();
  await conversation.save();
};

export const buyItem = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("shop", "owner");

  if (!item) {
    return next(new AppError("No item found with that ID", 404));
  }

  const sellerId = item.shop?.owner || item.owner;
  const subtotal = Number(item.price ?? 0);
  const { orderLocation = null } = req.body;

  if (orderLocation && !await MeetingPlace.exists({ _id: orderLocation, active: true })) {
    return next(new AppError("Meeting place not found.", 400));
  }

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
    orderLocation,
    initialStatus: "pending",
  });

  res.status(201).json({
    status: "success",
    data: { order },
  });
});


export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({
    $or: [{ buyer: req.user._id }, { seller: req.user._id }],
  })
    .populate("item", "translation price media")
    .populate({
      path: "offer",
      select: "status askingPrice offeredPrice offerLocation",
      populate: { path: "offerLocation" },
    })
    .populate("orderLocation")
    .populate("meetupLocation")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: { orders },
  });
});

export const getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("item", "translation price media")
    .populate("offer")
    .populate("buyer", "fullname")
    .populate("seller", "fullname")
    .populate("orderLocation")
    .populate("meetupLocation");

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  // if (!canAccessOrder(order, req.user._id)) {
  //   return next(new AppError("You are not allowed to view this order.", 403));
  // }

  res.status(200).json({
    status: "success",
    data: { order },
  });
});

export const confirmOrder = catchAsync(async (req, res, next) => {
  return next(
    new AppError(
      "Use the meetup acceptance endpoint with a date and meeting place.",
      400,
    ),
  );
});

export const acceptOrderWithMeetup = catchAsync(async (req, res, next) => {
  const { meetupDate, meetupLocation } = req.body;
  if (!meetupDate || !meetupLocation) {
    return next(new AppError("Meetup date and location are required.", 400));
  }
  const dateTime = new Date(meetupDate);
  if (Number.isNaN(dateTime.getTime()) || dateTime <= new Date()) {
    return next(new AppError("Meetup must be scheduled in the future.", 400));
  }
  const [order, meetingPlace] = await Promise.all([
    Order.findById(req.params.id),
    MeetingPlace.findOne({ _id: meetupLocation, active: true }),
  ]);
  if (!order) return next(new AppError("Order not found.", 404));
  if (!meetingPlace) return next(new AppError("Meeting place not found.", 400));
  if (String(order.seller) !== String(req.user._id)) {
    return next(new AppError("Only the seller can accept this order.", 403));
  }
  if (order.status !== "pending" || !["pending_seller", "change_requested"].includes(order.meetupStatus)) {
    return next(new AppError("This order cannot be scheduled.", 400));
  }

  order.meetupDate = dateTime;
  order.meetupLocation = meetingPlace._id;
  order.meetupStatus = "pending_buyer_confirmation";
  order.status = "pending";
  order.changeRequestReason = "";
  await order.save();
  await order.populate("meetupLocation");
  await addOrderSystemMessage(order, req.user._id, `Meetup proposed: ${meetingPlace.name} at ${order.meetupDate.toISOString()}.`);

  res.status(200).json({ status: "success", data: { order } });
});

export const confirmMeetup = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError("Order not found.", 404));
  if (String(order.buyer) !== String(req.user._id)) {
    return next(new AppError("Only the buyer can confirm this meetup.", 403));
  }
  if (order.status !== "pending" || order.meetupStatus !== "pending_buyer_confirmation") {
    return next(new AppError("This meetup is not awaiting confirmation.", 400));
  }
  order.status = "confirmed";
  order.meetupStatus = "confirmed";
  await order.save();
  await addOrderSystemMessage(order, req.user._id, "Buyer confirmed the meetup.");
  res.status(200).json({ status: "success", data: { order } });
});

export const requestMeetupChange = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError("Order not found.", 404));
  if (String(order.buyer) !== String(req.user._id)) {
    return next(new AppError("Only the buyer can request a change.", 403));
  }
  if (order.status !== "pending" || order.meetupStatus !== "pending_buyer_confirmation") {
    return next(new AppError("This meetup cannot be changed now.", 400));
  }
  order.status = "pending";
  order.meetupStatus = "change_requested";
  order.changeRequestReason = String(req.body.reason || "").trim().slice(0, 500);
  await order.save();
  await addOrderSystemMessage(order, req.user._id, `Buyer requested a meetup change${order.changeRequestReason ? `: ${order.changeRequestReason}` : "."}`);
  res.status(200).json({ status: "success", data: { order } });
});

export const rejectOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (order.seller.toString() !== req.user._id.toString()) {
    return next(
      new AppError("Only the seller can reject this order.", 403),
    );
  }

  if (order.status !== "pending") {
    return next(new AppError("Only pending orders can be rejected.", 400));
  }

  const cancelledOrder = await cancelOrderTransaction({
    orderId: id,
    cancellationReason: reason || "Cancelled by the seller.",
  });

  res.status(200).json({
    status: "success",
    data: { order: cancelledOrder },
  });
});

export const cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError("Order not found.", 404));
  if (String(order.buyer) !== String(req.user._id)) {
    return next(new AppError("Only the buyer can cancel this order.", 403));
  }
  const cancelledOrder = await cancelOrderTransaction({
    orderId: order._id,
    cancellationReason: "Cancelled by the buyer.",
  });
  await addOrderSystemMessage(cancelledOrder, req.user._id, "Buyer cancelled the order.");
  res.status(200).json({ status: "success", data: { order: cancelledOrder } });
});

export const completeOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (!canAccessOrder(order, req.user._id)) {
    return next(
      new AppError("You are not allowed to complete this order.", 403),
    );
  }

  if (order.status !== "confirmed") {
    return next(
      new AppError(
        "Only accepted orders can be completed.",
        400,
      ),
    );
  }

  order.status = "completed";

  await order.save();

  res.status(200).json({
    status: "success",
    data: { order },
  });
});

