import Business from "../models/businessModel.js";
import Item from "../models/itemModel.js";
import { catchAsync } from "../utils/catchAsync.js";

export const search = catchAsync(async (req, res) => {
  console.log('-------------------------------------🧈🥞🥞🥞🧇🍳🍳🍳-------------')
  const { search = "", category = "" } = req.query;
  console.log('search:', search, 'category:', category)
  const limit = Number(req.query.limit) || 10;
  const itemQuery = {};
  const businessQuery = {};

  // Search filter
  if (search.trim()) {
    const regex = {
      $regex: search.trim(),
      $options: "i",
    };

    itemQuery.$or = [
      { "translation.fa.title": regex },
      { "translation.ps.title": regex },
      { "translation.en.title": regex },
    ];

    businessQuery.$or = [
      { "translation.fa.title": regex },
      { "translation.ps.title": regex },
      { "translation.en.title": regex },
    ];
  }

  // Category filter
  if (category.trim()) {
    itemQuery.category = category;
    businessQuery.category = category; // Only if Business has a category field
  }
  console.log('-------------------------------------🧈🥞🥞🥞🧇🍳🍳🍳-------------')
console.log(itemQuery, businessQuery)
  const [items, businesses] = await Promise.all([
    Item.find(itemQuery).limit(limit),
    Business.find(businessQuery).limit(limit),
  ]);
console.log(items.length, businesses.length)
  res.status(200).json({
    status: "success",
    data: {
      items,
      businesses,
    },
  });
});