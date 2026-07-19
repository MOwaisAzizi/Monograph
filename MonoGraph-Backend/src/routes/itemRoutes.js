import express from "express";
import { createItem, deleteItem, getAllItems, getItem, updateItem } from "../controllers/itemControllers.js";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/').get(getAllItems).post(protect, createItem);
router.route('/:id').get(getItem).patch(updateItem).delete(deleteItem);

export default router;
