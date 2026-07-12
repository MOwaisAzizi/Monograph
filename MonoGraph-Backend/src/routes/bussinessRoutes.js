import express from "express";
import {
  createBusiness,
  getBusinesses,
  getBusiness,
  updateBusiness,
  deleteBusiness
} from "../controllers/bussinessControllers.js";

const router = express.Router();

router.get("/", getBusinesses);

router.post("/", createBusiness);
router.get("/:id", getBusiness).patch("/:id", updateBusiness).delete("/:id", deleteBusiness);

export default router;
