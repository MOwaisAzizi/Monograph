import express from "express";
import {
  createShop,
  deleteShop,
  getShop,
  getShopItems,
  getSimilarShops,
  getShops,
  toggleFollowShop,
  updateShop,
} from "../controllers/shopControllers.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadMediaFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router
  .route("/")
  .get(getShops)
  .post(
    protect,
    uploadMediaFiles("shop", { cover: 1, profile: 1 }),
    createShop,
  );
router.get("/mine", protect, getShops);
router.post("/follow/:shopId", protect, toggleFollowShop);
router.get("/:id/similar", getSimilarShops);
router.get("/:id/items", getShopItems);
router
  .route("/:id")
  .get(getShop)
  .patch(
    protect,
    uploadMediaFiles("shop", { cover: 1, profile: 1 }),
    updateShop,
  )
  .delete(protect, deleteShop);
export default router;
