import { Router } from "express";
import { initiatePayment, validatePayment } from "../controller/payment.controller.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = Router();

router.get("/initiate",ClerkExpressRequireAuth(), initiatePayment);
router.get("/validate/:merchantTransactionId",ClerkExpressRequireAuth(), validatePayment);


export default router;