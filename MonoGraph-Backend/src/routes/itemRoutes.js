import express from "express";
import {
  createItem,
  deleteItem,
  getAllItems,
  getItem,
  similarItems,
  updateItem,
} from "../controllers/itemControllers.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadMediaFiles } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router
  .route("/")
  .get(getAllItems)
  .post(protect, uploadMediaFiles("item", { media: 6 }), createItem);
router.get("/mine", protect, getAllItems);
router
  .route("/:id")
  .get(getItem)
  .patch(protect, uploadMediaFiles("item", { media: 6 }), updateItem)
  .delete(protect, deleteItem);
  router.route("/similar/:id").get(similarItems)

export default router;
