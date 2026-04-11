import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../services/api";
import getErrorMessage from "../../utils/getErrorMessage";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, thunkAPI) => {
    try {
      const { data } = await api.get("/products", { params });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAdminProducts = createAsyncThunk(
  "products/fetchAdminProducts",
  async (params = {}, thunkAPI) => {
    try {
      const { data } = await api.get("/products/admin", { params });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "products/fetchProductDetails",
  async (productId, thunkAPI) => {
    try {
      const { data } = await api.get(`/products/${productId}`);
      return data.product;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createProductReview = createAsyncThunk(
  "products/createProductReview",
  async ({ productId, rating, comment }, thunkAPI) => {
    try {
      const { data } = await api.post(`/products/${productId}/reviews`, { rating, comment });
      return data.product;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData, thunkAPI) => {
    try {
      const { data } = await api.post("/products", productData);
      return data.product;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ productId, productData }, thunkAPI) => {
    try {
      const { data } = await api.put(`/products/${productId}`, productData);
      return data.product;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productId, thunkAPI) => {
    try {
      await api.delete(`/products/${productId}`);
      return productId;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  items: [],
  categories: [],
  adminItems: [],
  pagination: null,
  adminPagination: null,
  selectedProduct: null,
  detailLoading: false,
  reviewLoading: false,
  isLoading: false,
  adminLoading: false,
  error: null,
  adminError: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.products;
        state.categories = action.payload.categories;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminProducts.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminItems = action.payload.products;
        state.adminPagination = action.payload.pagination;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.adminItems.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.adminItems = state.adminItems.map((product) =>
          product._id === action.payload._id ? action.payload : product
        );
        state.items = state.items.map((product) =>
          product._id === action.payload._id ? action.payload : product
        );
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.adminItems = state.adminItems.filter(
          (product) => product._id !== action.payload
        );
        state.items = state.items.filter((product) => product._id !== action.payload);
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      .addCase(createProductReview.pending, (state) => {
        state.reviewLoading = true;
        state.error = null;
      })
      .addCase(createProductReview.fulfilled, (state, action) => {
        state.reviewLoading = false;
        state.selectedProduct = action.payload;
        state.items = state.items.map((product) =>
          product._id === action.payload._id ? action.payload : product
        );
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
