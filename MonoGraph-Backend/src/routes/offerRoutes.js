import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createOffer,
  getOfferById,
  listOffers,
  respondToOffer,
  acceptOffer,
  cancelOffer
} from "../controllers/offerController.js";

const router = express.Router();

router.use(protect);
router.route("/").post(createOffer).get(listOffers);
router.route("/:id").get(getOfferById);
router.post("/:id/accept", acceptOffer);
router.patch("/:id/respond", respondToOffer);
router.patch("/:id/cancel", cancelOffer);

export default router;
