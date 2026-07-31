import Shop from "../models/shopModel.js";
import Item from "../models/itemModel.js";
import { catchAsync } from "../utils/catchAsync.js";

export const search = catchAsync(async (req, res) => {
  console.log(
    "-------------------------------------🧈🥞🥞🥞🧇🍳🍳🍳-------------",
  );
  const { search = "", category = "" } = req.query;
  console.log("search:", search, "category:", category);
  const limit = Number(req.query.limit) || 10;
  const itemQuery = {};
  const shopQuery = {};

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

    shopQuery.$or = [
      { "translation.fa.title": regex },
      { "translation.ps.title": regex },
      { "translation.en.title": regex },
    ];
  }

  // Category filter
  if (category.trim()) {
    itemQuery.category = category;
    shopQuery.category = category;
  }
  console.log(
    "-------------------------------------🧈🥞🥞🥞🧇🍳🍳🍳-------------",
  );
  const [items, shops] = await Promise.all([
    Item.find(itemQuery).limit(limit),
    Shop.find(shopQuery).limit(limit),
  ]);
  res.status(200).json({
    status: "success",
    data: {
      items,
      shops,
    },
  });
});
