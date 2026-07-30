import express from 'express';
import { createOrUpdateShopReview, deleteShopReview, getShopReviews } from '../controllers/reviewControllers.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/shops/:shopId', getShopReviews);
router.post('/shops/:shopId', protect, createOrUpdateShopReview);
router.delete('/shops/:shopId', protect, deleteShopReview);
export default router;
