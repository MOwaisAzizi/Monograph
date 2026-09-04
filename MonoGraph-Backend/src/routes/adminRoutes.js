import express from "express";
// TEMPORARY: disable admin auth so dashboard data can be viewed without login.
// import { protect, isAdmin } from "../middleware/authMiddleware.js";
import * as admin from "../controllers/adminController.js";

const router = express.Router();
// TEMPORARY: admin authentication is disabled for dashboard access.
// router.use(protect, isAdmin);
router.get("/users", admin.listUsers); router.patch("/users/:id", admin.updateUser);
router.get("/offers", admin.listOffersAdmin); router.patch("/offers/:id/status", admin.updateOfferStatus);
router.get("/orders", admin.listOrdersAdmin); router.patch("/orders/:id/status", admin.updateOrderStatus);
router.get("/items", admin.listItemsAdmin); router.patch("/items/:id/status", admin.updateItemStatus);
router.get("/shops", admin.listShopsAdmin); router.patch("/shops/:id/status", admin.updateShopStatus);
export default router;
