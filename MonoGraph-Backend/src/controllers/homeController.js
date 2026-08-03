import { catchAsync } from "../utils/catchAsync.js";
import Items from "../models/itemModel.js";
import Shop from "../models/shopModel.js";

export const getHomepageData = catchAsync(async (req, res) => {
  const category = String(req.query.category || "").trim();
  const itemFilter = category ? { category } : {};
  const shopFilter = category ? { category } : {};
  // console.log('🥨🥐🍞🍞🍞')
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
        .sort({ location: 1 })
        .limit(6)
        .select("media translation createdAt location rating"),
    ]);
  console.log("🥨🥐🍞🍞🍞");
  console.log(nearestItems);
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
