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

export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (params = {}, thunkAPI) => {
  try {
    const { data } = await api.get("/users", { params });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const createAdminUser = createAsyncThunk(
  "admin/createAdminUser",
  async (payload, thunkAPI) => {
    try {
      const { data } = await api.post("/users", payload);
      return data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateUserManagement = createAsyncThunk(
  "admin/updateUserManagement",
  async ({ userId, ...payload }, thunkAPI) => {
    try {
      const { data } = await api.put(`/users/${userId}/manage`, payload);
      return data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteAdminUser = createAsyncThunk(
  "admin/deleteAdminUser",
  async (userId, thunkAPI) => {
    try {
      await api.delete(`/users/${userId}`);
      return userId;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  "admin/fetchAdminOrders",
  async (params = {}, thunkAPI) => {
    try {
      const { data } = await api.get("/orders/admin", { params });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createAdminOrder = createAsyncThunk(
  "admin/createAdminOrder",
  async (payload, thunkAPI) => {
    try {
      const { data } = await api.post("/orders/admin", payload);
      return data.order;
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

export const updateAdminOrder = createAsyncThunk(
  "admin/updateAdminOrder",
  async ({ orderId, ...payload }, thunkAPI) => {
    try {
      const { data } = await api.put(`/orders/admin/${orderId}`, payload);
      return data.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteAdminOrder = createAsyncThunk(
  "admin/deleteAdminOrder",
  async (orderId, thunkAPI) => {
    try {
      await api.delete(`/orders/admin/${orderId}`);
      return orderId;
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

export const deleteAdminImage = createAsyncThunk(
  "admin/deleteAdminImage",
  async (publicId, thunkAPI) => {
    try {
      await api.delete("/uploads/image", {
        data: { publicId },
      });
      return publicId;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  stats: null,
  users: [],
  usersPagination: null,
  orders: [],
  ordersPagination: null,
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
        state.users = action.payload.users;
        state.usersPagination = action.payload.pagination;
      })
      .addCase(createAdminUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.unshift(action.payload);
      })
      .addCase(updateUserManagement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.ordersPagination = action.payload.pagination;
      })
      .addCase(createAdminOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(updateAdminOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(deleteAdminOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders.filter((order) => order._id !== action.payload);
      })
      .addCase(uploadAdminImage.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadedImage = action.payload;
      })
      .addCase(deleteAdminImage.fulfilled, (state, action) => {
        state.uploadLoading = false;
        if (state.uploadedImage?.publicId === action.payload) {
          state.uploadedImage = null;
        }
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("admin/") &&
          action.type.endsWith("/pending") &&
          action.type !== "admin/uploadAdminImage/pending" &&
          action.type !== "admin/deleteAdminImage/pending",
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type === "admin/uploadAdminImage/pending" ||
          action.type === "admin/deleteAdminImage/pending",
        (state) => {
          state.uploadLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("admin/") &&
          action.type.endsWith("/rejected") &&
          action.type !== "admin/uploadAdminImage/rejected" &&
          action.type !== "admin/deleteAdminImage/rejected",
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      )
      .addMatcher(
        (action) =>
          action.type === "admin/uploadAdminImage/rejected" ||
          action.type === "admin/deleteAdminImage/rejected",
        (state, action) => {
          state.uploadLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearUploadedImage } = adminSlice.actions;
export default adminSlice.reducer;
