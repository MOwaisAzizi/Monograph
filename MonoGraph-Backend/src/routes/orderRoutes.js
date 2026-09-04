import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyOrders,
  getOrderById,
  confirmOrder,
  buyItem,
  rejectOrder,
  acceptOrderWithMeetup,
  confirmMeetup,
  requestMeetupChange,
  cancelOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.use(protect);
router.post("/:id", buyItem);
router.get("/mine", getMyOrders);
router.get("/:id", getOrderById);
router.post("/:id/confirm", confirmOrder);
router.post("/:id/reject", rejectOrder);
router.patch("/:id/cancel", cancelOrder);
router.patch("/:id/accept", acceptOrderWithMeetup);
router.patch("/:id/meetup/confirm", confirmMeetup);
router.patch("/:id/meetup/request-change", requestMeetupChange);
export default router;
