import Business from "../models/businessModel.js";
import Item from "../models/itemModel.js";
import { catchAsync } from "../utils/catchAsync.js";

export const search = catchAsync(async (req, res, next) => {
  const { search, category } = req.query;
console.log(category, search);
  const limit = Number(req.query.limit) || 10;

  if (!search || search.trim() === "") {
    return res.status(200).json({
      status: "success",
      data: {
        items: [],
        businesses: []
      }
    });
  }

  const regex = {
    $regex: search,
    $options: "i"
  };

  const items = await Item.find({
    $or: [
      { "translation.fa.title": regex },
      { "translation.ps.title": regex },
      { "translation.en.title": regex }
    ]
  }).limit(limit);


  const businesses = await Business.find({
    $or: [
      { "translation.fa.title": regex },
      { "translation.ps.title": regex },
      { "translation.en.title": regex }
    ]
  }).limit(limit);


  res.status(200).json({
    status: "success",
    data: {
      items,
      businesses
    }
  });
});