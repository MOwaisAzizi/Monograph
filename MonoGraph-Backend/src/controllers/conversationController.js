import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Item from "../models/itemModel.js";

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
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("participants", "fullname email")
    .sort({ lastMessageAt: -1, createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: { conversations },
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
