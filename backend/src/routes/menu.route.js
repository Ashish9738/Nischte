import express, { Router } from "express";
import {
  createMenu,
  getMenuItem,
  updateMenu,
  deleteItem,
  getAllMenuOfShop,
  getXitems,
} from "../controller/menu.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = Router();

router.route("/menu").get(getXitems);
router.route("/:shopId/menu").post(ClerkExpressRequireAuth(), upload.single("picture"), createMenu);
router.route("/:shopId/menu").get(getAllMenuOfShop);
router.route("/:shopId/menu/:itemId").get(getMenuItem);
router
  .route("/:shopId/menu/:itemId")
  .patch(upload.single("picture"), updateMenu);
router.route("/:shopId/menu/:itemId").delete(ClerkExpressRequireAuth(), deleteItem);

export default router;
