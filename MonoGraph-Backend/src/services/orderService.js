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
    location,
    offerId = null,
    initialStatus,
}) => {
    // Update item status
    const item = await Item.findOneAndUpdate(
        { _id: itemId},
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
            { $set: { status: "accepted" } }
        );

        // Reject all other pending offers for this item
        await Offer.updateMany(
            { item: itemId, status: "pending", _id: { $ne: offerId } },
            { $set: { status: "rejected" } }
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
            location,
            status: initialStatus,
        },
    ]);

    return order;
};

export const rejectOrder = async ({ orderId, rejectionReason }) => {
    // Update order status
    const order = await Order.findOneAndUpdate(
        { _id: orderId, status: { $ne: "completed" } },
        {
            $set: {
                status: "rejected",
                rejectionReason,
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