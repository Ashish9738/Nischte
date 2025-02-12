import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Route Dec

import shopRouter from "../src/routes/shop.route.js";
import shopMenuRouter from "../src/routes/menu.route.js";
import orderRouter from "../src/routes/order.route.js";
import offerRouter from "../src/routes/offer.route.js";
import supportRouter from "../src/routes/support.route.js";
import paymentRouter from "../src/routes/payment.route.js";

app.use("/api/v1/shop", shopMenuRouter);
app.use("/api/v1/shop", shopRouter);
app.use("/api/v1/support", supportRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/offer", offerRouter);
app.get("/api/v1/payment", paymentRouter);

export default app;
