import express from "express";
import { signup, login, updateProfile, getUserProfile, toggleFavoriteItemOrBusiness } from "../controllers/userControllers.js"
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.route('/profile').get(protect, getUserProfile).patch(protect, updateProfile);
router.route('/toggle-favorite').patch(protect, toggleFavoriteItemOrBusiness);

export default router;
