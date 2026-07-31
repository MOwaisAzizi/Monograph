import express from "express";
import {
  createShop,
  deleteShop,
  getShop,
  getShopItems,
  getShops,
  toggleFollowShop,
  updateShop,
} from "../controllers/shopControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.route("/").get(getShops).post(protect, createShop);
router.post("/follow/:shopId", protect, toggleFollowShop);
router.get("/:id/items", getShopItems);
router
  .route("/:id")
  .get(getShop)
  .patch(protect, updateShop)
  .delete(protect, deleteShop);
export default router;
