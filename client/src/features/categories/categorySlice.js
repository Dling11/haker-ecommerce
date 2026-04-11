import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../services/api";
import getErrorMessage from "../../utils/getErrorMessage";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/categories");
      return data.categories;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchAdminCategories = createAsyncThunk(
  "categories/fetchAdminCategories",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/categories/admin");
      return data.categories;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (payload, thunkAPI) => {
    try {
      const { data } = await api.post("/categories", payload);
      return data.category;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ categoryId, ...payload }, thunkAPI) => {
    try {
      const { data } = await api.put(`/categories/${categoryId}`, payload);
      return data.category;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (categoryId, thunkAPI) => {
    try {
      await api.delete(`/categories/${categoryId}`);
      return categoryId;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  items: [],
  adminItems: [],
  isLoading: false,
  adminLoading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminCategories.pending, (state) => {
        state.adminLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminItems = action.payload;
      })
      .addCase(fetchAdminCategories.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.adminItems.unshift(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.adminItems = state.adminItems.map((category) =>
          category._id === action.payload._id ? action.payload : category
        );
        state.items = state.items.map((category) =>
          category._id === action.payload._id ? action.payload : category
        );
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.adminItems = state.adminItems.filter(
          (category) => category._id !== action.payload
        );
        state.items = state.items.filter((category) => category._id !== action.payload);
      });
  },
});

export default categorySlice.reducer;
