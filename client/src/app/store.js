import { configureStore } from "@reduxjs/toolkit";

import adminReducer from "../features/admin/adminSlice";
import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";
import orderReducer from "../features/orders/orderSlice";
import productReducer from "../features/products/productSlice";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
  },
});
