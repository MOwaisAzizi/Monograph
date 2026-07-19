import Business from "../models/businessModel.js";
import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createBusiness = catchAsync(async (req, res, next) => {
  const business = await Business.create({
    ...req.body,
    owner: req.user._id,
  });

  res.status(201).json({ status: "success", data: { business } });
});

export const getBusinesses = catchAsync(async (req, res, next) => {
  const businesses = await Business.find();
  res.status(200).json({ status: "success", results: businesses.length, data: { businesses } });
});

export const getBusiness = catchAsync(async (req, res, next) => {
  const business = await Business.findById(req.params.id);
  if (!business) return next(new AppError("No business found with that ID", 404));
  res.status(200).json({ status: "success", data: { business } });
});

export const updateBusiness = catchAsync(async (req, res, next) => {
  const business = await Business.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!business) return next(new AppError("No business found with that ID", 404));
  res.status(200).json({ status: "success", data: { business } });
});

export const deleteBusiness = catchAsync(async (req, res, next) => {
  const business = await Business.findByIdAndDelete(req.params.id);
  if (!business) return next(new AppError("No business found with that ID", 404));
  res.status(204).json({ status: "success", data: null });
});
