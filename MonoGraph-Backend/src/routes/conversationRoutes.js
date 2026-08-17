import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getOrCreateConversation,
  listConversations,
  getConversationMessages,
  sendMessage,
} from "../controllers/conversationController.js";

const router = express.Router();

router.use(protect);
router.post("/open", getOrCreateConversation);
router.get("/", listConversations);
router.get("/:id/messages", getConversationMessages);
router.post("/:id/messages", sendMessage);

export default router;
