import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../services/api";
import getErrorMessage from "../../utils/getErrorMessage";

export const fetchPublicSiteSettings = createAsyncThunk(
  "site/fetchPublicSiteSettings",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/settings/public");
      return data.settings;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  settings: null,
  isLoading: false,
  error: null,
};

const siteSlice = createSlice({
  name: "site",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicSiteSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addMatcher(
        (action) => action.type.startsWith("site/") && action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("site/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export default siteSlice.reducer;
