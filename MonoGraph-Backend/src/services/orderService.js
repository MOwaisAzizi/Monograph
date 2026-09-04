import mongoose from "mongoose";
import Item from "../models/itemModel.js";
import Offer from "../models/offerModel.js";
import Order from "../models/orderModel.js";
import AppError from "../utils/AppError.js";

export const createOrder = async ({
    itemId,
    buyerId,
    sellerId,
    subtotal,
    total,
    orderLocation = null,
    offerId = null,
    initialStatus,
}) => {
    // Update item status
    const item = await Item.findOneAndUpdate(
        { _id: itemId },
        { new: true }
    );

    if (!item) {
        throw new AppError("Item is not available.", 400);
    }

    // Handle offer if provided
    if (offerId) {
        const offer = await Offer.findOne({
            _id: offerId,
            item: itemId,
            status: "pending",
        });

        if (!offer) {
            // Revert item status if offer is invalid
            await Item.updateOne(
                { _id: itemId },
                { $set: { status: "available" } }
            );
            throw new AppError("Offer is no longer pending.", 400);
        }

        // Accept the specific offer
        await Offer.updateOne(
            { _id: offerId, status: "pending" },
            { $set: { status: "confirmed" } }
        );

        // Close all other pending offers for this item.
        await Offer.updateMany(
            { item: itemId, status: "pending", _id: { $ne: offerId } },
            { $set: { status: "cancelled" } }
        );
    }

    // Create the order
    const [order] = await Order.create([
        {
            item: itemId,
            offer: offerId,
            buyer: buyerId,
            seller: sellerId,
            subtotal,
            total,
            orderLocation,
            status: initialStatus,
        },
    ]);

    await order.populate("orderLocation");
    return order;
};

export const cancelOrder = async ({ orderId, cancellationReason }) => {
    const order = await Order.findOneAndUpdate(
        { _id: orderId, status: { $in: ["pending", "confirmed"] } },
        {
            $set: {
                status: "cancelled",
                rejectionReason: cancellationReason,
            },
        },
        { new: true }
    );

    if (!order) {
        throw new AppError("Order cannot be rejected.", 400);
    }

    // Make item available again
    await Item.updateOne(
        { _id: order.item, status: "reserved" },
        { $set: { status: "available" } }
    );

    return order;
};
