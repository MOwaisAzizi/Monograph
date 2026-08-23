import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import Offer from "../models/offerModel.js";
import Order from "../models/orderModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Item from "../models/itemModel.js";
import { getConversationRole, getConversationStatusMeta } from "../helpers/conversationInbox.js";

export const getOrCreateConversation = catchAsync(async (req, res, next) => {
  const { itemId } = req.body;

  if (!itemId) {
    return next(
      new AppError("Item is required to open a conversation.", 400),
    );
  }

  const item = await Item.findById(itemId);
  if (!item) {
    return next(new AppError("No item found for this conversation.", 404));
  }

  const buyerId = req.user._id;
  // Never trust a client supplied seller id.  Products may belong to a shop,
  // but item.owner is the user who must receive the conversation.
  const sellerId = item.owner;
  if (!sellerId) {
    return next(new AppError("Item seller is not configured.", 400));
  }
  if (String(buyerId) === String(sellerId)) {
    return next(new AppError("You cannot start a conversation about your own item.", 400));
  }

  const participants = [buyerId.toString(), sellerId.toString()].sort();

  let conversation = await Conversation.findOne({
    item: itemId,
    participants: { $all: participants },
  }).populate("participants", "fullname email");

  // Repair conversations created before seller ownership was enforced instead
  // of creating a second thread for the same item and buyer.
  if (!conversation) {
    conversation = await Conversation.findOne({
      item: itemId,
      participants: buyerId,
    }).populate("participants", "fullname email");

    if (conversation) {
      conversation.participants = participants;
      await conversation.save();
    }
  }

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
  const userId = req.user._id;

  // 1. Pull everything the user is party to, independently.
  //    A thread can exist via any one of these three, or all three.
  const ownedItems = await Item.find({ owner: userId }).select("_id").lean();
  const ownedItemIds = ownedItems.map((item) => item._id);

  const [conversations, offers, orders] = await Promise.all([
    // Include threads for the user's items as well as participant threads.
    // This also makes seller inboxes resilient to legacy rows missing owner.
    Conversation.find({ $or: [{ participants: userId }, { item: { $in: ownedItemIds } }] })
      .populate("participants", "fullname email")
      .populate("item", "translation media owner price")
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean(),
    Offer.find({ $or: [{ buyer: userId }, { seller: userId }] })
      .populate("item", "translation media owner price")
      .sort({ createdAt: -1 })
      .lean(),
    // Order's own item/buyer/seller are the source of truth for Buy Now
    // orders (no Offer exists for those). For orders that came from an
    // accepted Offer, fall back to offer.item/buyer/seller if the order's
    // own fields were ever left blank.
    Order.find({ $or: [{ buyer: userId }, { seller: userId }] })
      .populate("item", "translation media owner price")
      .populate({
        path: "offer",
        select: "item buyer seller askingPrice offeredPrice status",
        populate: { path: "item", select: "translation media owner price" },
      })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const conversationIds = conversations.map((c) => c._id);
  const latestMessages = conversationIds.length
    ? await Message.find({ conversation: { $in: conversationIds } })
        .sort({ createdAt: -1 })
        .lean()
    : [];

  const latestMessageByConversation = latestMessages.reduce((acc, message) => {
    const key = String(message.conversation);
    if (!acc[key]) acc[key] = message; // already sorted desc = latest first
    return acc;
  }, {});

  // 2. Thread key = item + buyer. Seller is implied (item.owner in the
  //    common case), so this key is stable regardless of which side
  //    req.user is on, and works even when there's no Conversation.
  const threadKey = (itemId, buyerId) => `${String(itemId)}:${String(buyerId)}`;

  const threads = new Map(); // key -> { item, buyerId, sellerId, conversation, offer, order }

  const getOrCreateThread = (itemDoc, buyerId, sellerId) => {
    if (!itemDoc || !buyerId) return null; // can't place this without knowing the thread
    const key = threadKey(itemDoc._id, buyerId);
    let thread = threads.get(key);
    if (!thread) {
      thread = {
        key,
        item: itemDoc,
        buyerId: String(buyerId),
        sellerId: sellerId ? String(sellerId) : String(itemDoc.owner),
        conversation: null,
        offer: null,
        order: null,
      };
      threads.set(key, thread);
    }
    return thread;
  };

  // Conversations: buyer = whichever participant isn't item.owner.
  for (const conversation of conversations) {
    const item = conversation.item;
    if (!item) continue;
    const ownerId = String(item.owner);
    const otherParticipant = (conversation.participants || []).find(
      (p) => String(p._id || p) !== String(userId),
    );
    const buyerId = ownerId === String(userId) ? otherParticipant?._id : userId;
    if (!buyerId) continue;

    const thread = getOrCreateThread(item, buyerId, ownerId);
    if (thread && !thread.conversation) thread.conversation = conversation;
  }

  // Offers: seller is optional on the schema — fall back to item.owner.
  for (const offer of offers) {
    const item = offer.item;
    if (!item) continue;
    const sellerId = offer.seller || item.owner;
    const thread = getOrCreateThread(item, offer.buyer, sellerId);
    if (thread && !thread.offer) thread.offer = offer; // sorted desc = latest first
  }

  // Orders: item/buyer/seller are optional here — fall back through the
  // linked Offer (and that Offer's item) when the Order's own fields are empty.
  for (const order of orders) {
    const item = order.item || order.offer?.item;
    if (!item) continue;
    const buyerId = order.buyer || order.offer?.buyer;
    const sellerId = order.seller || order.offer?.seller || item.owner;
    const thread = getOrCreateThread(item, buyerId, sellerId);
    if (thread && !thread.order) thread.order = order;
  }

  // 3. Shape rows.
  const rows = [...threads.values()]
    .map((thread) => {
      const { item, conversation, offer, order } = thread;
      const isSeller = String(item.owner) === String(userId);
      const role = isSeller ? "selling" : "buying";

      if (roleFilter && role !== roleFilter) return null;

      const otherParticipant =
        conversation?.participants?.find(
          (p) => String(p._id || p) !== String(userId),
        ) || null;

      const lastMessage = conversation
        ? latestMessageByConversation[String(conversation._id)] || null
        : null;

      const statusMeta = getConversationStatusMeta({
        latestOffer: offer,
        latestOrder: order,
        lastMessage,
      });

      return {
        _id: conversation?._id || null, // null when no conversation exists yet — front end routes by item/buyer instead
        threadKey: thread.key,
        hasConversation: Boolean(conversation),
        item,
        role,
        otherParticipant, // null until a conversation exists
        buyerId: thread.buyerId,
        sellerId: thread.sellerId,
        conversation: conversation
          ? { _id: conversation._id, lastMessageAt: conversation.lastMessageAt }
          : null,
        latestOffer: offer
          ? {
              _id: offer._id,
              buyer: offer.buyer,
              seller: offer.seller || item.owner,
              status: offer.status,
              askingPrice: offer.askingPrice,
              offeredPrice: offer.offeredPrice,
              updatedAt: offer.updatedAt,
            }
          : null,
        latestOrder: order
          ? {
              _id: order._id,
              buyer: order.buyer || order.offer?.buyer,
              seller: order.seller || order.offer?.seller || item.owner,
              status: order.status,
              total: order.total,
              updatedAt: order.updatedAt,
            }
          : null,
        // Buy Now creates an Order with no linked Offer. An Offer being
        // negotiated/accepted always has order.offer set once the Order exists.
        isDirectBuy: Boolean(order && !order.offer && !offer),
        lastMessage,
        statusText: statusMeta.label,
        statusPill: statusMeta.pill,
        sortAt:
          conversation?.lastMessageAt ||
          order?.createdAt ||
          offer?.createdAt ||
          item.createdAt,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.sortAt) - new Date(a.sortAt));

  res.status(200).json({
    status: "success",
    data: { conversations: rows },
  });
});

const ensureItemOwnerParticipant = async (conversation, userId) => {
  const item = await Item.findById(conversation.item).select("owner").lean();
  const isParticipant = conversation.participants.some(
    (participant) => participant.toString() === userId.toString(),
  );
  const isOwner = item?.owner && String(item.owner) === String(userId);

  if (!isParticipant && isOwner) {
    const buyer = conversation.participants.find(
      (participant) => String(participant) !== String(item.owner),
    );
    conversation.participants = [buyer, item.owner].filter(Boolean);
    await conversation.save();
    return true;
  }

  return isParticipant;
};

export const getConversationMessages = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const conversation = await Conversation.findById(id);

  if (!conversation) {
    return next(new AppError("Conversation not found.", 404));
  }

  if (!(await ensureItemOwnerParticipant(conversation, req.user._id))) {
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

  if (!(await ensureItemOwnerParticipant(conversation, req.user._id))) {
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
