import { catchAsync } from "../utils/catchAsync.js";
import Items from "../models/itemModel.js";
import Shop from "../models/shopModel.js";

export const getHomepageData = catchAsync(async (req, res) => {
  const category = String(req.query.category || "").trim();
  const itemFilter = category ? { category } : {};
  const shopFilter = category ? { category } : {};
  
  const [newItems, cheapItems, highRatedItems, nearestItems, nearestShops] =
    await Promise.all([
      Items.find(itemFilter)
        .sort({ createdAt: -1 })
        .limit(6)
        .select("media distance translation price createdAt location rating"),

      Items.find(itemFilter)
        .sort({ price: 1 })
        .limit(6)
        .select("media distance translation price createdAt location rating"),

      Items.find(itemFilter)
        .sort({ rating: -1 })
        .limit(6)
        .select("media distance translation price createdAt location rating"),

      Items.find(itemFilter)
        .sort({ rating: -1 })
        .limit(6)
        .select("media distance translation price createdAt location rating"),

      Shop.find(shopFilter)
        .sort({ createdAt: -1 })
        .limit(6)
        .select("media distance translation price createdAt location rating"),
    ]);

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
