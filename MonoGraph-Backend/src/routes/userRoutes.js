import express from "express";
import { signup, login, updateProfile, getUserProfile } from "../controllers/userControllers.js"

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/profile", getUserProfile).patch("/profile", updateProfile);

export default router;
