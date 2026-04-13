const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { getSiteSettings } = require("../utils/siteSettings");
const { sendOrderConfirmationEmail } = require("../services/emailService");

const calculateTotals = (orderItems) => {
  const itemsPrice = Number(
    orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  const shippingPrice = itemsPrice >= 3000 ? 0 : 150;
  const taxPrice = Number((itemsPrice * 0.02).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, gcashReference, notes } = req.body;
  const settings = await getSiteSettings();
  const cart = await Cart.findOne({ user: req.user._id });

  if (!settings.allowCheckout) {
    res.status(403);
    throw new Error("Checkout is currently unavailable.");
  }

  if (paymentMethod === "cod" && !settings.allowCashOnDelivery) {
    res.status(403);
    throw new Error("Cash on Delivery is currently unavailable.");
  }

  if (paymentMethod === "gcash" && !settings.allowGCash) {
    res.status(403);
    throw new Error("GCash payments are currently unavailable.");
  }

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

  const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calculateTotals(cart.items);

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

  if (req.user.isEmailVerified) {
    try {
      await sendOrderConfirmationEmail({
        to: req.user.email,
        user: req.user,
        order,
      });
    } catch (error) {
      console.error("Failed to send order confirmation email:", error.message);
    }
  }

  res.status(201).json({
    success: true,
    message: "Order placed successfully.",
    order,
  });
});

const createAdminOrder = asyncHandler(async (req, res) => {
  const {
    userId,
    orderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    orderStatus,
    gcashReference,
    notes,
  } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const normalizedOrderItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.productId);

    if (!product || !product.isPublished) {
      res.status(404);
      throw new Error("One of the selected products could not be found.");
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}.`);
    }

    normalizedOrderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || "",
      price: product.price,
      quantity: item.quantity,
    });
  }

  const totals = calculateTotals(normalizedOrderItems);
  const resolvedPaymentStatus =
    paymentStatus || (paymentMethod === "gcash" ? "paid" : "pending");
  const resolvedOrderStatus =
    orderStatus || (paymentMethod === "gcash" ? "processing" : "pending");

  const order = await Order.create({
    user: user._id,
    orderItems: normalizedOrderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: resolvedPaymentStatus,
    orderStatus: resolvedOrderStatus,
    paidAt: resolvedPaymentStatus === "paid" ? new Date() : null,
    deliveredAt: resolvedOrderStatus === "delivered" ? new Date() : null,
    gcashReference: paymentMethod === "gcash" ? gcashReference || "" : "",
    notes: notes || "",
    ...totals,
  });

  await Promise.all(
    normalizedOrderItems.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      })
    )
  );

  const populatedOrder = await Order.findById(order._id).populate("user", "name email");

  res.status(201).json({
    success: true,
    message: "Order created successfully.",
    order: populatedOrder,
  });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  const productIds = [
    ...new Set(
      orders.flatMap((order) => order.orderItems.map((item) => item.product?.toString()).filter(Boolean))
    ),
  ];

  const products = await Product.find({ _id: { $in: productIds } })
    .select("_id stock isPublished")
    .lean();
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  const normalizedOrders = orders.map((order) => {
    const orderItems = order.orderItems.map((item) => {
      const currentProduct = productMap.get(item.product?.toString());
      const availableQuantity =
        currentProduct && currentProduct.isPublished ? currentProduct.stock : 0;

      return {
        ...item,
        isAvailable: availableQuantity > 0,
        availableQuantity,
      };
    });

    return {
      ...order,
      orderItems,
      canReorder: orderItems.some((item) => item.isAvailable),
    };
  });

  res.status(200).json({
    success: true,
    orders: normalizedOrders,
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
  const {
    keyword = "",
    paymentMethod = "all",
    orderStatus = "all",
    sort = "newest",
    page = 1,
    limit = 10,
  } = req.query;

  const userQuery = keyword
    ? {
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
        ],
      }
    : {};

  const matchedUserIds = keyword
    ? await User.find(userQuery).distinct("_id")
    : [];

  const query = {};

  if (keyword) {
    query.$or = [
      { _id: /^[a-fA-F0-9]{24}$/.test(keyword) ? keyword : undefined },
      { user: { $in: matchedUserIds } },
    ].filter(Boolean);
  }

  if (paymentMethod !== "all") {
    query.paymentMethod = paymentMethod;
  }

  if (orderStatus !== "all") {
    query.orderStatus = orderStatus;
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    total_high: { totalPrice: -1 },
    total_low: { totalPrice: 1 },
  };

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const [orders, totalOrders] = await Promise.all([
    Order.find(query)
      .populate("user", "name email")
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(limitNumber),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    orders,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limitNumber),
    },
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

const updateAdminOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  const {
    shippingAddress,
    paymentMethod,
    paymentStatus,
    orderStatus,
    gcashReference,
    notes,
  } = req.body;

  if (shippingAddress) {
    order.shippingAddress = {
      ...order.shippingAddress.toObject(),
      ...shippingAddress,
    };
  }

  if (paymentMethod) {
    order.paymentMethod = paymentMethod;
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
    order.paidAt = paymentStatus === "paid" ? order.paidAt || new Date() : null;
  }

  if (orderStatus) {
    order.orderStatus = orderStatus;
    if (orderStatus === "delivered") {
      order.deliveredAt = order.deliveredAt || new Date();
    }
    if (orderStatus !== "delivered") {
      order.deliveredAt = null;
    }
  }

  if (gcashReference !== undefined) {
    order.gcashReference = gcashReference;
  }

  if (notes !== undefined) {
    order.notes = notes;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order updated successfully.",
    order,
  });
});

const deleteAdminOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order deleted successfully.",
  });
});

module.exports = {
  createAdminOrder,
  createOrder,
  deleteAdminOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateAdminOrder,
  updateOrderStatus,
};
