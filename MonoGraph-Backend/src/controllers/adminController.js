import User from "../models/userModel.js";
import Offer from "../models/offerModel.js";
import Order from "../models/orderModel.js";
import Item from "../models/itemModel.js";
import Shop from "../models/shopModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

const pageOptions = (query) => ({
  page: Math.max(1, Number.parseInt(query.page, 10) || 1),
  limit: Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20)),
});

const response = (res, key, documents, total, { page, limit }) =>
  res.status(200).json({
    status: "success",
    results: documents.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { [key]: documents },
  });

const escaped = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const translationSearch = (search) => ({
  $or: [
    { "translation.en.title": { $regex: escaped(search), $options: "i" } },
    { "translation.fa.title": { $regex: escaped(search), $options: "i" } },
    { "translation.ps.title": { $regex: escaped(search), $options: "i" } },
  ],
});

export const listUsers = catchAsync(async (req, res) => {
  const { page, limit } = pageOptions(req.query);
  const search = String(req.query.search || "").trim();
  const filter = search ? { $or: [
    { fullname: { $regex: escaped(search), $options: "i" } },
    { email: { $regex: escaped(search), $options: "i" } },
    { phone: { $regex: escaped(search), $options: "i" } },
  ] } : {};
  const [users, total] = await Promise.all([
    User.find(filter).select("fullname email phone role createdAt").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  response(res, "users", users, total, { page, limit });
});

const peopleFor = async (search) => search ? User.find({ $or: [{ fullname: { $regex: escaped(search), $options: "i" } }, { email: { $regex: escaped(search), $options: "i" } }] }).distinct("_id") : [];

export const listOffersAdmin = catchAsync(async (req, res) => {
  const { page, limit } = pageOptions(req.query); const search = String(req.query.search || "").trim();
  const filter = req.query.status ? { status: req.query.status } : {};
  if (search) {
    const [people, items] = await Promise.all([peopleFor(search), Item.find(translationSearch(search)).distinct("_id")]);
    filter.$or = [{ _id: /^[a-f\d]{24}$/i.test(search) ? search : null }, { buyer: { $in: people } }, { seller: { $in: people } }, { item: { $in: items } }];
  }
  const query = Offer.find(filter).populate("item", "translation price media").populate("buyer", "fullname email").populate("seller", "fullname email").sort({ createdAt: -1 });
  const [offers, total] = await Promise.all([query.skip((page - 1) * limit).limit(limit), Offer.countDocuments(filter)]);
  response(res, "offers", offers, total, { page, limit });
});

export const listOrdersAdmin = catchAsync(async (req, res) => {
  const { page, limit } = pageOptions(req.query); const search = String(req.query.search || "").trim();
  const filter = req.query.status ? { status: req.query.status } : {};
  if (search) {
    const [people, items] = await Promise.all([peopleFor(search), Item.find(translationSearch(search)).distinct("_id")]);
    filter.$or = [{ _id: /^[a-f\d]{24}$/i.test(search) ? search : null }, { buyer: { $in: people } }, { seller: { $in: people } }, { item: { $in: items } }];
  }
  const query = Order.find(filter).populate("item", "translation price media").populate("buyer", "fullname email").populate("seller", "fullname email").sort({ createdAt: -1 });
  const [orders, total] = await Promise.all([query.skip((page - 1) * limit).limit(limit), Order.countDocuments(filter)]);
  response(res, "orders", orders, total, { page, limit });
});

const listCatalog = (Model, key, populate) => catchAsync(async (req, res) => {
  const { page, limit } = pageOptions(req.query); const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) Object.assign(filter, translationSearch(req.query.search));
  const query = Model.find(filter).populate(populate).sort({ createdAt: -1 });
  const [records, total] = await Promise.all([query.skip((page - 1) * limit).limit(limit), Model.countDocuments(filter)]);
  response(res, key, records, total, { page, limit });
});
export const listItemsAdmin = listCatalog(Item, "items", "shop owner");
export const listShopsAdmin = listCatalog(Shop, "shops", "owner");

const updateStatus = (Model, allowed) => catchAsync(async (req, res, next) => {
  const { status } = req.body;
  if (!allowed.includes(status)) return next(new AppError("Invalid status.", 400));
  const record = await Model.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!record) return next(new AppError("Record not found.", 404));
  res.status(200).json({ status: "success", data: { record } });
});
export const updateOfferStatus = updateStatus(Offer, ["pending", "accepted", "rejected", "cancelled"]);
export const updateOrderStatus = updateStatus(Order, ["pending", "pending_buyer_confirmation", "confirmed", "change_requested", "accepted", "completed", "rejected", "cancelled"]);
export const updateItemStatus = updateStatus(Item, ["available", "reserved", "sold"]);
export const updateShopStatus = updateStatus(Shop, ["pending", "under_review", "closed", "accepted"]);

export const updateUser = catchAsync(async (req, res, next) => {
  const changes = {}; if (["user", "admin"].includes(req.body.role)) changes.role = req.body.role;
  if (!Object.keys(changes).length) return next(new AppError("Only a valid role can be changed.", 400));
  const user = await User.findByIdAndUpdate(req.params.id, changes, { new: true, runValidators: true }).select("fullname email phone role createdAt");
  if (!user) return next(new AppError("User not found.", 404));
  res.status(200).json({ status: "success", data: { user } });
});
