import express from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
  updateProfile,
  getUserProfile,
  toggleFavoriteItemOrShop,
  getUserStats,
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadMediaFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", protect, logout);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .patch(protect, uploadMediaFiles("user", { profile: 1 }), updateProfile);
router.route("/toggle-favorite").patch(protect, toggleFavoriteItemOrShop);
router.get("/stats", protect, getUserStats);

export default router;
