import Order from "../models/orderModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { rejectOrder as rejectOrderTransaction } from "../services/orderService.js";

const canAccessOrder = (order, userId) =>
  order.buyer.toString() === userId.toString() ||
  order.seller.toString() === userId.toString();

export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({
    $or: [{ buyer: req.user._id }, { seller: req.user._id }],
  })
    .populate("item", "translation price media")
    .populate("offer", "status askingPrice offeredPrice")
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
    .populate("seller", "fullname");

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

  if (order.status === "rejected") {
    return next(
      new AppError("A rejected order cannot be accepted.", 400),
    );
  }

  if (order.status === "completed") {
    return next(new AppError("This order is already completed.", 400));
  }

  order.status = "accepted";

  await order.save();

  res.status(200).json({
    status: "success",
    data: { order },
  });
});

export const rejectOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (!canAccessOrder(order, req.user._id)) {
    return next(
      new AppError("You are not allowed to reject this order.", 403),
    );
  }

  if (order.status === "completed") {
    return next(
      new AppError("A completed order cannot be rejected.", 400),
    );
  }

  const rejectedOrder = await rejectOrderTransaction({
    orderId: id,
    rejectionReason: reason || "Rejected by a participant.",
  });

  res.status(200).json({
    status: "success",
    data: { order: rejectedOrder },
  });
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

  if (order.status !== "accepted") {
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