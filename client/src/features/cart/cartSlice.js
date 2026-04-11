import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../services/api";
import getErrorMessage from "../../utils/getErrorMessage";

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/cart");
    return data.cart;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const addCartItem = createAsyncThunk(
  "cart/addCartItem",
  async ({ productId, quantity = 1 }, thunkAPI) => {
    try {
      const { data } = await api.post("/cart", { productId, quantity });
      return data.cart;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ itemId, quantity }, thunkAPI) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      return data.cart;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (itemId, thunkAPI) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      return data.cart;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const clearCart = createAsyncThunk("cart/clearCart", async (_, thunkAPI) => {
  try {
    const { data } = await api.delete("/cart/clear/all");
    return data.cart;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

const initialState = {
  cart: {
    items: [],
    itemsPrice: 0,
  },
  isDrawerOpen: false,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCartState: (state) => {
      state.cart = { items: [], itemsPrice: 0 };
      state.isDrawerOpen = false;
      state.isLoading = false;
      state.error = null;
    },
    openCartDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    toggleCartDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) =>
          action.type.startsWith("cart/") && action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("cart/") && action.type.endsWith("/fulfilled"),
        (state, action) => {
          state.isLoading = false;
          state.cart = action.payload;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("cart/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetCartState, openCartDrawer, closeCartDrawer, toggleCartDrawer } =
  cartSlice.actions;
export default cartSlice.reducer;
