import { getHomepageData } from "../controllers/homeController.js";
import express from "express";

const router = express.Router();
router.route('/').get(getHomepageData);

export default router;