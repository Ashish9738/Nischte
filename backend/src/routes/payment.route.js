import { Router } from "express";
import { initiatePayment, savePaymentDetails, validatePayment } from "../controller/payment.controller.js";

const router = Router();

router.get("/initiate", initiatePayment);
router.get("/validate/:merchantTransactionId", validatePayment);
router.post("/save", savePaymentDetails);


export default router;