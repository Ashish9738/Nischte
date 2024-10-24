import { Order } from "../models/order.model.js";

export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      cartTotal,
      transactionId,
      originalQuantity,
      totalItems,
      totalSavings,
      // deliveryStatus = "Pending",
    } = req.body;

    // console.log("body", req.body);

    if (
      !userId ||
      !items ||
      !transactionId ||
      !cartTotal ||
      !originalQuantity ||
      !totalItems ||
      !totalSavings
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const order = new Order({
      userId,
      items,
      cartTotal,
      transactionId,
      originalQuantity,
      totalItems,
      totalSavings,
    });

    const savedOrder = await order.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully.",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error in creating order: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create the order.",
      error: error.message,
    });
  }
};

export const getAllUserOrder = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userOrder = await Order.find({ userId });
    res.status(200).json(userOrder);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get all the user order",
      error: error.message,
    });
  }
};

export const getSpecificOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get the order details",
      error: error.message,
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order and its items deleted successfully",
      deletedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete order",
      error: error.message,
    });
  }
};
