import { catchAsync } from "../utils/catchAsync.js";
import Items from "../models/itemModel.js";
import Business from "../models/businessModel.js";

export const getHomepageData = catchAsync(async (req, res) => {
// console.log('🥨🥐🍞🍞🍞')
  const [newItems, cheapItems, highRatedItems, nearestItems, nearestShops] =
    await Promise.all([
      Items.find()
        .sort({ createdAt: -1 })
        .limit(6).select('media translation createdAt location rating'),

      Items.find()
        .sort({ price: -1 })
        .limit(6).select('media translation createdAt location rating'),

      Items.find()
        .sort({ rating: -1 })
        .limit(6).select('media translation createdAt location rating'),

      Items.find().sort({ rating: -1})
        .limit(6).select('media translation createdAt location rating'),

      Business
      .find()
        .sort({ location: 1 })
        .limit(6).select('media translation createdAt location rating')
    ]);
console.log('🥨🥐🍞🍞🍞')
// console.log(nearestItems)
  res.status(200).json({
    status: "success",
    data: {
      cheapItems,
      highRatedItems,
      newItems,
      nearestItems,
      nearestShops
    },
  });
});