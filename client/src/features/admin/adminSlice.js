import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../services/api";
import getErrorMessage from "../../utils/getErrorMessage";

export const fetchDashboardStats = createAsyncThunk(
  "admin/fetchDashboardStats",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/admin/stats");
      return data.stats;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/users");
    return data.users;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const updateUserManagement = createAsyncThunk(
  "admin/updateUserManagement",
  async ({ userId, role, status }, thunkAPI) => {
    try {
      const { data } = await api.put(`/users/${userId}/manage`, { role, status });
      return data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  "admin/fetchAdminOrders",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/orders/admin");
      return data.orders;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateAdminOrderStatus = createAsyncThunk(
  "admin/updateAdminOrderStatus",
  async ({ orderId, orderStatus, paymentStatus }, thunkAPI) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, {
        orderStatus,
        paymentStatus,
      });
      return data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const uploadAdminImage = createAsyncThunk(
  "admin/uploadAdminImage",
  async ({ file, folder }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", folder);

      const { data } = await api.post("/uploads/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return data.image;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  stats: null,
  users: [],
  orders: [],
  isLoading: false,
  error: null,
  uploadLoading: false,
  uploadedImage: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearUploadedImage: (state) => {
      state.uploadedImage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(updateUserManagement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(uploadAdminImage.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadedImage = action.payload;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("admin/") &&
          action.type.endsWith("/pending") &&
          action.type !== "admin/uploadAdminImage/pending",
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type === "admin/uploadAdminImage/pending",
        (state) => {
          state.uploadLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("admin/") &&
          action.type.endsWith("/rejected") &&
          action.type !== "admin/uploadAdminImage/rejected",
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      )
      .addMatcher(
        (action) => action.type === "admin/uploadAdminImage/rejected",
        (state, action) => {
          state.uploadLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearUploadedImage } = adminSlice.actions;
export default adminSlice.reducer;
