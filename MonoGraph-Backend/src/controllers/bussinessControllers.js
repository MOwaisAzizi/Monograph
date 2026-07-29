import Business from "../models/businessModel.js";
import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import Follow from "../models/followModel.js";

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

export const followShop = catchAsync(async (req, res, next) => {
  console.log('-------followShop controller');
  const { shopId } = req.params;
  const userId = req.user._id;
  const followingType = req.body.followingType || 'business';

  const shop = await Business.findById(shopId);

  if (!shop) {
    return next(new AppError('Shop not found', 404));
  }

  const follow = await Follow.findOne({
    user: userId,
    following: shopId,
    followingType: followingType,
  });

  if (follow) {
    await follow.deleteOne();

    return res.status(200).json({
      message: 'Shop unfollowed successfully!',
    });
  }

  await Follow.create({
    user: userId,
    following: shopId,
    followingType: followingType,
  });

  res.status(201).json({
    message: 'Shop followed successfully!',
  });
});