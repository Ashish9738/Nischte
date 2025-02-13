import express, { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getAllUserOrder,
  getOrdersForOwner,
} from "../controller/order.contoller.js";

const router = Router();

router.route("/create").post(createOrder);
router.route("/user/view/:userId").get(getAllUserOrder);
router.route("/shop/view/:shopId").get(getOrdersForOwner);
router.route("/:orderId").delete(deleteOrder); //On-hold

export default router;
