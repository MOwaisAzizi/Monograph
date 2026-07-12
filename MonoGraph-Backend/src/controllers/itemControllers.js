import Item from "../models/itemModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createItem = catchAsync(async (req, res, next) => {
    const item = await Item.create(req.body);

    res.status(201).json({
        status: "success",
        data: { item },
    });
});

export const getAllItems = catchAsync(async (req, res, next) => {
    const filter = {};

    if (req.query.business) filter.business = req.query.business;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.type) filter.type = req.query.type;

    const Items = await Item.find(filter)
        .populate("business", "translation")
        .populate("category", "translation");

    res.status(200).json({
        status: "success",
        results: Items.length,
        data: { Items },
    });
});

export const getItem = catchAsync(async (req, res, next) => {
    const Item = await Item.findById(req.params.id)
        .populate("business", "translation")
        .populate("category", "translation");

    if (!Item) {
        return next(new AppError("No Item found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { Item },
    });
});


export const updateItem = catchAsync(async (req, res, next) => {
    const Item = await Item.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!Item) {
        return next(new AppError("No Item found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { Item },
    });
});

export const deleteItem = catchAsync(async (req, res, next) => {
    const Item = await Item.findByIdAndDelete(req.params.id);

    if (!Item) {
        return next(new AppError("No Item found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});
