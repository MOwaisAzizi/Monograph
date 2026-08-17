import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyOrders,
  getOrderById,
  confirmOrder,
  cancelOrder,
  disputeOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.use(protect);
router.get("/mine", getMyOrders);
router.get("/:id", getOrderById);
router.post("/:id/confirm", confirmOrder);
router.post("/:id/cancel", cancelOrder);
router.post("/:id/dispute", disputeOrder);

export default router;
