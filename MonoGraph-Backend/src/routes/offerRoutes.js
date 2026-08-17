import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createOffer,
  getOfferById,
  listOffers,
  respondToOffer,
  proposeLocation,
  confirmLocation,
} from "../controllers/offerController.js";

const router = express.Router();

router.use(protect);
router.route("/").post(createOffer).get(listOffers);
router.route("/:id").get(getOfferById);
router.patch("/:id/respond", respondToOffer);
router.patch("/:id/location", proposeLocation);
router.patch("/:id/confirm-location", confirmLocation);

export default router;
