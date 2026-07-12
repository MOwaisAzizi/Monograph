import Category from "../models/CategoryModel.js";
import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createCategory = catchAsync(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ status: "success", data: { category } });
});

export const getAllCategories = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.business) filter.business = req.query.business;

  const categories = await Category.find(filter);
  res.status(200).json({
    status: "success",
    results: categories.length,
    data: { categories },
  });
});

export const getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("No category found with that ID", 404));
  }

  res.status(204).json({ status: "success", data: category });
});


export const updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new AppError("No category found with that ID", 404));
  }

  res.status(200).json({ status: "success", data: { category } });
});

export const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new AppError("No category found with that ID", 404));
  }

  res.status(204).json({ status: "success", data: null });
});
