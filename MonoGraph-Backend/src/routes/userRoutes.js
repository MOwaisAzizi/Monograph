import express from "express";
import { signup, login, updateProfile, getUserProfile } from "../controllers/userControllers.js"
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.route('/profile').get(protect, getUserProfile).patch(protect, updateProfile);

export default router;
