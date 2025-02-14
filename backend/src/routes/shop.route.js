import express, { Router } from "express";
import {
  createShop,
  deleteUser,
  getAllOwnerShops,
  getShop,
  getShops,
  updateShop,
} from "../controller/shop.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = Router();

router.route("/").post(ClerkExpressRequireAuth(), upload.single("picture"), createShop);
router.route("/").get(getShops);
router.route("/:id").get(getShop);
router.route("/own/:ownerId").get(getAllOwnerShops);
router.route("/:id").patch(ClerkExpressRequireAuth(), upload.single("picture"), updateShop);
router.route("/:id").delete(ClerkExpressRequireAuth(), deleteUser);

export default router;
