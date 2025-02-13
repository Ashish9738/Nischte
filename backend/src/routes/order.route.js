import express, { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getAllUserOrder,
  getOrdersForOwner,
} from "../controller/order.contoller.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = Router();

router.route("/create").post(ClerkExpressRequireAuth(), createOrder);
router.route("/user/view/:userId").get(getAllUserOrder);
router.route("/shop/view/:shopId").get(getOrdersForOwner);
router.route("/:orderId").delete(ClerkExpressRequireAuth(), deleteOrder); //On-hold

export default router;
