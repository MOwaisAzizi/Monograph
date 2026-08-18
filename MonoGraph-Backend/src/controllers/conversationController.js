import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import Offer from "../models/offerModel.js";
import Order from "../models/orderModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Item from "../models/itemModel.js";
import { getConversationRole, getConversationStatusMeta } from "../helpers/conversationInbox.js";

export const getOrCreateConversation = catchAsync(async (req, res, next) => {
  const { itemId, sellerId } = req.body;

  if (!itemId || !sellerId) {
    return next(
      new AppError("Item and seller are required to open a conversation.", 400),
    );
  }

  const item = await Item.findById(itemId);
  if (!item) {
    return next(new AppError("No item found for this conversation.", 404));
  }

  const buyerId = req.user._id;
  const participants = [buyerId.toString(), sellerId].sort();

  let conversation = await Conversation.findOne({
    item: itemId,
    participants: { $all: participants },
  }).populate("participants", "fullname email");

  if (!conversation) {
    conversation = await Conversation.create({
      item: itemId,
      participants: participants,
    });

    conversation = await conversation.populate(
      "participants",
      "fullname email",
    );
  }

  res.status(200).json({
    status: "success",
    data: { conversation },
  });
});

export const listConversations = catchAsync(async (req, res) => {
  const roleFilter = String(req.query.role || "")
    .trim()
    .toLowerCase();

  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("participants", "fullname email")
    .populate("item", "translation media owner price")
    .sort({ lastMessageAt: -1, createdAt: -1 })
    .lean();

  const conversationIds = conversations.map((conversation) => conversation._id);
  const itemIds = [...new Set(conversations.map((conversation) => String(conversation.item?._id)).filter(Boolean))];

  const [latestMessages, latestOffers, latestOrders] = await Promise.all([
    Message.find({ conversation: { $in: conversationIds } })
      .sort({ createdAt: -1 })
      .lean(),
    Offer.find({ item: { $in: itemIds } })
      .sort({ createdAt: -1 })
      .lean(),
    Order.find({ item: { $in: itemIds } })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const latestMessagesByConversation = latestMessages.reduce((acc, message) => {
    const key = String(message.conversation);
    if (!acc[key]) acc[key] = message;
    return acc;
  }, {});

  const latestOffersByItem = latestOffers.reduce((acc, offer) => {
    const key = String(offer.item);
    if (!acc[key]) acc[key] = offer;
    return acc;
  }, {});

  const latestOrderByOffer = latestOrders.reduce((acc, order) => {
    const key = String(order.offer);
    if (!acc[key]) acc[key] = order;
    return acc;
  }, {});

  const rows = conversations
    .map((conversation) => {
      const item = conversation.item;
      const role = getConversationRole({ item, currentUserId: req.user._id });

      if (roleFilter && role !== roleFilter) {
        return null;
      }

      const itemId = item && item._id ? String(item._id) : "";
      const latestOffer = itemId ? latestOffersByItem[itemId] : null;
      const latestOrder = latestOffer ? latestOrderByOffer[String(latestOffer._id)] : null;
      const lastMessage = latestMessagesByConversation[String(conversation._id)] || null;
      const otherParticipant = (conversation.participants || []).find(
        (participant) => String(participant._id || participant) !== String(req.user._id),
      );

      return {
        ...conversation,
        role,
        item,
        otherParticipant: otherParticipant || null,
        latestOffer: latestOffer
          ? {
            _id: latestOffer._id,
            status: latestOffer.status,
            price: latestOffer.proposedPrice ?? latestOffer.price,
            isDirectBuy: Boolean(latestOffer.isDirectBuy),
          }
          : null,
        latestOrder: latestOrder ? { _id: latestOrder._id, status: latestOrder.status } : null,
        lastMessage,
        statusText: getConversationStatusMeta({ latestOffer, latestOrder, lastMessage }).label,
        statusPill: getConversationStatusMeta({ latestOffer, latestOrder, lastMessage }).pill,
      };
    })
    .filter(Boolean);

  res.status(200).json({
    status: "success",
    data: { conversations: rows },
  });
});

export const getConversationMessages = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const conversation = await Conversation.findById(id);

  if (!conversation) {
    return next(new AppError("Conversation not found.", 404));
  }

  if (
    !conversation.participants.some(
      (participant) => participant.toString() === req.user._id.toString(),
    )
  ) {
    return next(new AppError("You are not part of this conversation.", 403));
  }

  const messages = await Message.find({ conversation: id })
    .populate("sender", "fullname")
    .sort({ createdAt: 1 });

  res.status(200).json({
    status: "success",
    data: { conversation, messages },
  });
});

export const sendMessage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !String(content).trim()) {
    return next(new AppError("Message content is required.", 400));
  }

  const conversation = await Conversation.findById(id);
  if (!conversation) {
    return next(new AppError("Conversation not found.", 404));
  }

  if (
    !conversation.participants.some(
      (participant) => participant.toString() === req.user._id.toString(),
    )
  ) {
    return next(new AppError("You are not part of this conversation.", 403));
  }

  const message = await Message.create({
    conversation: id,
    sender: req.user._id,
    content: String(content).trim(),
    type: "text",
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  res.status(201).json({
    status: "success",
    data: { message },
  });
});
