import { catchAsync } from "../utils/catchAsync.js";
import Items from "../models/itemModel.js";
import Shop from "../models/shopModel.js";

export const getHomepageData = catchAsync(async (req, res) => {
  const category = String(req.query.category || "").trim();
  const itemFilter = category ? { category } : {};
  const shopFilter = category ? { category } : {};
  console.log('🥨🥐🍞🍞🍞')
  console.log(category)
  console.log(itemFilter) 
  console.log(shopFilter)
  const [newItems, cheapItems, highRatedItems, nearestItems, nearestShops] =
    await Promise.all([
      Items.find(itemFilter)
        .sort({ createdAt: -1 })
        .limit(6)
        .select("media translation createdAt location rating"),

      Items.find(itemFilter)
        .sort({ price: 1 })
        .limit(6)
        .select("media translation createdAt location rating"),

      Items.find(itemFilter)
        .sort({ rating: -1 })
        .limit(6)
        .select("media translation createdAt location rating"),

      Items.find(itemFilter)
        .sort({ rating: -1 })
        .limit(6)
        .select("media translation createdAt location rating"),

      Shop.find(shopFilter)
        .sort({ createdAt: -1 })
        .limit(6)
        .select("media translation createdAt location rating"),
    ]);
    newItems.map(item => {
      console.log(item.translation)
    })
  res.status(200).json({
    status: "success",
    data: {
      cheapItems,
      highRatedItems,
      newItems,
      nearestItems,
      nearestShops,
    },
  });
});
