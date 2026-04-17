import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../services/api";
import getErrorMessage from "../../utils/getErrorMessage";

export const fetchWishlist = createAsyncThunk("wishlist/fetchWishlist", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/wishlist");
    return data.wishlist;
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const addWishlistItem = createAsyncThunk(
  "wishlist/addWishlistItem",
  async (productId, thunkAPI) => {
    try {
      const { data } = await api.post(`/wishlist/${productId}`);
      return data.wishlist;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  "wishlist/removeWishlistItem",
  async (productId, thunkAPI) => {
    try {
      const { data } = await api.delete(`/wishlist/${productId}`);
      return data.wishlist;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    resetWishlistState: (state) => {
      state.items = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) =>
          action.type.startsWith("wishlist/") && action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("wishlist/") && action.type.endsWith("/fulfilled"),
        (state, action) => {
          state.isLoading = false;
          state.items = action.payload;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("wishlist/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
