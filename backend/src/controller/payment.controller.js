import axios from "axios";
import sha256 from "sha256";
import uniqid from "uniqid";
import { Payment } from "../models/payment.model.js";
import { FRONTEND_URL, PHONEPE_HOST_URL, MERCHANT_ID, SALT_KEY, SALT_INDEX } from "../config/phone-pe.config.js";

export const initiatePayment = async (req, res) => {
  try {    
    const plainData = req.query.data;
    if (!plainData) {
      return res.status(400).json({ message: "Missing data" });
    }

    const parsedData = JSON.parse(plainData);
    const { amount } = parsedData;

    if (isNaN(amount)) {
      return res.status(400).json({ message: "Invalid data - amount is required" });
    }

    let merchantTransactionId = uniqid();

    const tempPaymentData = {
      merchantTransactionId,
      amount: amount * 100
    };

    const encodedData = Buffer.from(JSON.stringify(tempPaymentData)).toString('base64');

    let normalPayLoad = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      amount: amount * 100,
      redirectUrl: `${FRONTEND_URL}/payment/callback?data=${encodedData}`,
      redirectMode: "REDIRECT",
      paymentInstrument: {
        type: "PAY_PAGE"
      }
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
      res.status(200).json({
        success: true,
        redirectUrl: response.data.data.instrumentResponse.redirectInfo.url,
        merchantTransactionId,
        data: encodedData
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment initiation failed",
        error: response.data
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to initiate the payment",
      error: error.message
    });
  }
};

export const validatePayment = async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;

    if (!merchantTransactionId) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid transaction ID or missing data" 
      });
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

    if (response.data.code === "PAYMENT_SUCCESS") {
      const paymentData = response.data.data;
      
      const newPayment = new Payment({
        merchantTransactionId: paymentData.merchantTransactionId,
        transactionId: paymentData.transactionId,
        amount: paymentData.amount,
        state: paymentData.state,
        paymentInstrument: paymentData.paymentInstrument,
      });

      await newPayment.save();

      const redirectUrl = `${process.env.FRONTEND_URL}/payment/success?txnId=${merchantTransactionId}`;
      
      return res.redirect(redirectUrl);
    } else {
      const redirectUrl = `${process.env.FRONTEND_URL}/payment/failure?error=Payment failed&txnId=${merchantTransactionId}`;
      
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    const redirectUrl = `${process.env.FRONTEND_URL}/payment/failure?error=${encodeURIComponent(error.message)}`;
    return res.redirect(redirectUrl);
  }
};


export const savePaymentDetails = async (req, res) => {
  try {
    const { merchantTransactionId } = req.body;

    if (!merchantTransactionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: merchantTransactionId"
      });
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
      
      const existingPayment = await Payment.findOne({ merchantTransactionId });
      
      if (existingPayment) {
        return res.status(200).json({
          success: true,
          message: "Payment already saved",
          data: existingPayment
        });
      }

      const newPayment = new Payment({
        merchantTransactionId: paymentData.merchantTransactionId,
        transactionId: paymentData.transactionId,
        amount: paymentData.amount,
        state: paymentData.state,
        paymentInstrument: paymentData.paymentInstrument,
      });

      await newPayment.save();

      res.status(200).json({
        success: true,
        message: "Payment details saved successfully.",
        data: paymentData,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment validation failed.",
        data: response.data,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save payment details",
      error: error.message,
    });
  }
};
