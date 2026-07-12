import { catchAsync } from "../utils/catchAsync.js";
import Items from "../models/itemModel.js";

export const getHomepageData = catchAsync(async (req, res) => {

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

      Items.find({ isFeatured: true })
        .limit(6).select('media translation createdAt location rating'),

      Bussiness.find()
        .sort({ location: 1 })
        .limit(6).select('media translation createdAt location rating')
    ]);

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