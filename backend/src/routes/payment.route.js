import { Router } from "express";
import { initiatePayment, validatePayment } from "../controller/payment.controller.js";

const router = Router();

router.get("/initiate", initiatePayment);
router.get("/validate/:merchantTransactionId", validatePayment)

export default router;