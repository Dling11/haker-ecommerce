import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../services/api";
import getErrorMessage from "../../utils/getErrorMessage";

const persistedAuth = localStorage.getItem("haker-ecommerce-auth");

const initialPersistedState = persistedAuth
  ? JSON.parse(persistedAuth)
  : {
      user: null,
      token: null,
    };

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ email, otp }, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/verify-email", { email, otp });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const resendVerificationOtp = createAsyncThunk(
  "auth/resendVerificationOtp",
  async ({ email }, thunkAPI) => {
    try {
      const { data } = await api.post("/auth/resend-verification-otp", { email });
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/auth/me");
      return data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      const { data } = await api.put("/auth/profile", profileData);
      return data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      await api.post("/auth/logout");
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  user: initialPersistedState.user,
  token: initialPersistedState.token,
  pendingVerificationEmail: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("haker-ecommerce-auth", JSON.stringify(action.payload));
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.pendingVerificationEmail = null;
      localStorage.removeItem("haker-ecommerce-auth");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload.requiresEmailVerification) {
          state.user = null;
          state.token = null;
          state.pendingVerificationEmail = action.payload.email;
          localStorage.removeItem("haker-ecommerce-auth");
          return;
        }

        state.user = action.payload.user;
        state.token = action.payload.token;
        state.pendingVerificationEmail = null;
        localStorage.setItem(
          "haker-ecommerce-auth",
          JSON.stringify({
            user: action.payload.user,
            token: action.payload.token,
          })
        );
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.pendingVerificationEmail = null;
        localStorage.setItem(
          "haker-ecommerce-auth",
          JSON.stringify({
            user: action.payload.user,
            token: action.payload.token,
          })
        );
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.pendingVerificationEmail = null;
        localStorage.setItem(
          "haker-ecommerce-auth",
          JSON.stringify({
            user: action.payload.user,
            token: action.payload.token,
          })
        );
      })
      .addCase(resendVerificationOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingVerificationEmail = action.payload.email || state.pendingVerificationEmail;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload;
        localStorage.setItem(
          "haker-ecommerce-auth",
          JSON.stringify({
            user: action.payload,
            token: state.token,
          })
        );
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        localStorage.setItem(
          "haker-ecommerce-auth",
          JSON.stringify({
            user: action.payload,
            token: state.token,
          })
        );
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.token = null;
        state.pendingVerificationEmail = null;
        localStorage.removeItem("haker-ecommerce-auth");
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") && action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.isLoading = false;
          state.isInitialized = true;
          state.error = action.payload;

          if (action.type === "auth/fetchCurrentUser/rejected") {
            state.user = null;
            state.token = null;
            localStorage.removeItem("haker-ecommerce-auth");
          }
        }
      );
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
