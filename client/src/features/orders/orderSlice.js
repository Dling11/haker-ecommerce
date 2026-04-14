import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../services/api";
import getErrorMessage from "../../utils/getErrorMessage";

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, thunkAPI) => {
    try {
      const { data } = await api.post("/orders", orderData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const confirmPaymongoOrder = createAsyncThunk(
  "orders/confirmPaymongoOrder",
  async ({ orderId, checkoutSessionId }, thunkAPI) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/paymongo/confirm`, {
        checkoutSessionId,
      });
      return data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const continuePaymongoPayment = createAsyncThunk(
  "orders/continuePaymongoPayment",
  async (orderId, thunkAPI) => {
    try {
      const { data } = await api.post(`/orders/${orderId}/paymongo/checkout`);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMyOrders",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/orders/my-orders");
      return data.orders;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const cancelMyOrder = createAsyncThunk(
  "orders/cancelMyOrder",
  async (orderId, thunkAPI) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/cancel`);
      return data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  items: [],
  latestOrder: null,
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearLatestOrder: (state) => {
      state.latestOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.latestOrder = action.payload.order;
        if (action.payload.order) {
          state.items.unshift(action.payload.order);
        }
      })
      .addCase(confirmPaymongoOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.latestOrder = action.payload;
        state.items = state.items.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(cancelMyOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
        if (state.latestOrder?._id === action.payload._id) {
          state.latestOrder = action.payload;
        }
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("orders/") && action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("orders/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearLatestOrder } = orderSlice.actions;
export default orderSlice.reducer;
