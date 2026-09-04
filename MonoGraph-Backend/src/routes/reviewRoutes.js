import express from "express";
import {
  createOrUpdateShopReview,
  deleteShopReview,
  getShopReviews,
  createOrUpdateItemReview,
  deleteItemReview,
  getItemReviews,
} from "../controllers/reviewControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/shops/:shopId", getShopReviews);
router.post("/shops/:shopId", protect, createOrUpdateShopReview);
router.delete("/shops/:shopId", protect, deleteShopReview);
router.get("/items/:itemId", getItemReviews);
router.post("/items/:itemId", protect, createOrUpdateItemReview);
router.delete("/items/:itemId", protect, deleteItemReview);
export default router;
