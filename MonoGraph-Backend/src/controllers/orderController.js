import Order from "../models/orderModel.js";
import Offer from "../models/offerModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

const canAccessOrder = (order, userId) =>
  order.buyer.toString() === userId.toString() ||
  order.seller.toString() === userId.toString();

export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({
    $or: [{ buyer: req.user._id }, { seller: req.user._id }],
  })
    .populate("item", "translation price media")
    .populate("offer", "status price proposedPrice")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: { orders },
  });
});

export const getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("item", "translation price media")
    .populate("offer");

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (!canAccessOrder(order, req.user._id)) {
    return next(new AppError("You are not allowed to view this order.", 403));
  }

  res.status(200).json({
    status: "success",
    data: { order },
  });
});

export const confirmOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (!canAccessOrder(order, req.user._id)) {
    return next(
      new AppError("You are not allowed to confirm this order.", 403),
    );
  }

  if (order.status === "cancelled") {
    return next(
      new AppError("This order is cancelled and cannot be completed.", 400),
    );
  }

  if (order.status === "completed") {
    return next(new AppError("This order is already completed.", 400));
  }

  if (order.buyer.toString() === req.user._id.toString()) {
    order.buyerConfirmed = true;
  }

  if (order.seller.toString() === req.user._id.toString()) {
    order.sellerConfirmed = true;
  }

  if (order.buyerConfirmed && order.sellerConfirmed) {
    order.status = "completed";
  }

  await order.save();

  res.status(200).json({
    status: "success",
    data: { order },
  });
});

export const cancelOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (!canAccessOrder(order, req.user._id)) {
    return next(new AppError("You are not allowed to cancel this order.", 403));
  }

  if (order.status === "completed") {
    return next(new AppError("A completed order cannot be cancelled.", 400));
  }

  order.status = "cancelled";
  order.cancelledBy = req.user._id;
  await order.save();

  const offer = await Offer.findById(order.offer);
  if (offer) {
    offer.status = "cancelled";
    await offer.save();
  }

  res.status(200).json({
    status: "success",
    data: { order },
  });
});

export const disputeOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (!canAccessOrder(order, req.user._id)) {
    return next(
      new AppError("You are not allowed to dispute this order.", 403),
    );
  }

  if (order.status === "completed") {
    return next(new AppError("A completed order cannot be disputed.", 400));
  }

  order.status = "disputed";
  order.disputeReason = reason || "Disputed by a participant.";
  await order.save();

  res.status(200).json({
    status: "success",
    data: { order },
  });
});
