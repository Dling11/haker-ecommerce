const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, gcashReference, notes } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty.");
  }

  for (const item of cart.items) {
    const product = await Product.findById(item.product);

    if (!product || product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${item.name}.`);
    }
  }

  const itemsPrice = Number(cart.itemsPrice.toFixed(2));
  const shippingPrice = itemsPrice >= 3000 ? 0 : 150;
  const taxPrice = Number((itemsPrice * 0.02).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    orderItems: cart.items.map((item) => ({
      product: item.product,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    })),
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === "gcash" ? "paid" : "pending",
    paidAt: paymentMethod === "gcash" ? new Date() : null,
    orderStatus: paymentMethod === "gcash" ? "processing" : "pending",
    gcashReference: paymentMethod === "gcash" ? gcashReference || "" : "",
    notes: notes || "",
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  cart.items = [];
  cart.itemsPrice = 0;
  await cart.save();

  res.status(201).json({
    success: true,
    message: "Order placed successfully.",
    order,
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  if (req.user.role !== "admin" && order.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You are not allowed to view this order.");
  }

  res.status(200).json({
    success: true,
    order,
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  order.orderStatus = req.body.orderStatus || order.orderStatus;
  order.paymentStatus = req.body.paymentStatus || order.paymentStatus;

  if (order.orderStatus === "delivered" && !order.deliveredAt) {
    order.deliveredAt = new Date();
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order updated successfully.",
    order,
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
