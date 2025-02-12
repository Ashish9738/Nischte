import axios from "axios";
import sha256 from "sha256";
import uniqid from "uniqid";
import { Payment } from "../models/payment.model.js";
import { APP_BE_URL, PHONEPE_HOST_URL, MERCHANT_ID, SALT_KEY, SALT_INDEX } from "../config/phone-pe.config.js";

export const initiatePayment = async (req, res) => {
  try {
    const amount = req.body.amount * 100; 
    const user = req.body;
    
    const { userId, mobileNumber } = user;

    if (isNaN(amount)) {
      return res.status(400).json({
        message: "Invalid amount provided.",
      });
    }

    let merchantTransactionId = uniqid();

    let normalPayLoad = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: amount,
      redirectUrl: `${APP_BE_URL}/payment/validate/${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      mobileNumber: mobileNumber ? mobileNumber : null, 
      paymentInstrument: {
        type: "PAY_PAGE", 
      },
    };

    let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
    let base64EncodedPayload = bufferObj.toString("base64");

    let string = base64EncodedPayload + "/pg/v1/pay" + SALT_KEY;
    let sha256_val = sha256(string);
    let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

    const response = await axios.post(
      `${PHONEPE_HOST_URL}/pg/v1/pay`,
      { request: base64EncodedPayload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerifyChecksum,
          accept: "application/json",
        },
      }
    );

    if (response.data.success) {
      res.redirect(response.data.data.instrumentResponse.redirectInfo.url);
    } else {
      res.status(400).json({
        message: "Payment initiation failed",
        error: response.data,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to initiate the payment",
      error: error.message,
    });
  }
};


export const validatePayment = async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;
    const { userId, orderId } = req.body;

    if (!merchantTransactionId) {
      return res.status(400).json({ message: "Invalid transaction ID." });
    }

    const statusUrl = `${PHONEPE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;

    const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}${SALT_KEY}`;
    const sha256_val = sha256(string);
    const xVerifyChecksum = `${sha256_val}###${SALT_INDEX}`;

    const response = await axios.get(statusUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerifyChecksum,
        "X-MERCHANT-ID": MERCHANT_ID,
        accept: "application/json",
      },
    });

    if (response.data && response.data.code === "PAYMENT_SUCCESS") {

      const paymentData = response.data.data;
      const newPayment = new Payment({
        userId, 
        orderId,
        merchantTransactionId: paymentData.merchantTransactionId,
        transactionId: paymentData.transactionId,
        amount: paymentData.amount,
        state: paymentData.state,
        paymentInstrument: paymentData.paymentInstrument,
      });

      await newPayment.save();

      res.status(200).json({
        message: "Payment successful.",
        data: response.data,
      });
    } else {
      res.status(400).json({
        message: "Payment failed or pending.",
        data: response.data,
      });
    }
  } catch (error) {
    console.error("Payment validation error:", error);
    res.status(500).json({
      message: "Failed to validate the payment",
      error: error.message,
    });
  }
};