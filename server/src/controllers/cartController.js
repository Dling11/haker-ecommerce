const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

const calculateCartTotals = (cart) => {
  cart.itemsPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
};

const getMyCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  res.status(200).json({
    success: true,
    cart,
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);

  if (!product || !product.isPublished) {
    res.status(404);
    throw new Error("Product not found.");
  }

  const safeQuantity = Number(quantity || 1);

  if (safeQuantity > product.stock) {
    res.status(400);
    throw new Error("Requested quantity is greater than available stock.");
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => item.product.toString() === productId);

  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + safeQuantity, product.stock);
    existingItem.price = product.price;
    existingItem.stock = product.stock;
    existingItem.image = product.images[0].url;
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      image: product.images[0].url,
      price: product.price,
      quantity: safeQuantity,
      stock: product.stock,
    });
  }

  calculateCartTotals(cart);
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Item added to cart.",
    cart,
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);

  if (!item) {
    res.status(404);
    throw new Error("Cart item not found.");
  }

  const product = await Product.findById(item.product);

  if (!product) {
    res.status(404);
    throw new Error("Product linked to this cart item no longer exists.");
  }

  if (quantity < 1 || quantity > product.stock) {
    res.status(400);
    throw new Error("Quantity is invalid for the current product stock.");
  }

  item.quantity = quantity;
  item.price = product.price;
  item.stock = product.stock;
  calculateCartTotals(cart);
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart item updated.",
    cart,
  });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);

  if (!item) {
    res.status(404);
    throw new Error("Cart item not found.");
  }

  item.deleteOne();
  calculateCartTotals(cart);
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Item removed from cart.",
    cart,
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.itemsPrice = 0;
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully.",
    cart,
  });
});

module.exports = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
