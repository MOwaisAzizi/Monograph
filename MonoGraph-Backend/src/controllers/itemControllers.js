import Item from "../models/itemModel.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createItem = catchAsync(async (req, res, next) => {
    const itemDoc = await Item.create(req.body);

    res.status(201).json({
        status: "success",
        data: { item: itemDoc },
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
    const itemDoc = await Item.findById(req.params.id)
        .populate("business", "translation")
        .populate("category", "translation");

    if (!itemDoc) {
        return next(new AppError("No item found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { itemDoc },
    });
});


export const updateItem = catchAsync(async (req, res, next) => {
    const itemDoc = await item.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!itemDoc) {
        return next(new AppError("No item found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { itemDoc },
    });
});

export const deleteItem = catchAsync(async (req, res, next) => {
    const itemDoc = await item.findByIdAndDelete(req.params.id);

    if (!itemDoc) {
        return next(new AppError("No item found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});
