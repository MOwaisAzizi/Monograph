import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { listMeetingPlaces } from "../controllers/meetingPlaceController.js";

const router = express.Router();
router.use(protect);
router.get("/", listMeetingPlaces);

export default router;
