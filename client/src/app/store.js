import { configureStore } from "@reduxjs/toolkit";

import adminReducer from "../features/admin/adminSlice";
import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";
import categoryReducer from "../features/categories/categorySlice";
import orderReducer from "../features/orders/orderSlice";
import productReducer from "../features/products/productSlice";
import siteReducer from "../features/site/siteSlice";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,
    categories: categoryReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    site: siteReducer,
  },
});
