import { createSlice } from "@reduxjs/toolkit";

const savedUser = JSON.parse(localStorage.getItem("ledgerUser"));

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: savedUser || null,
    isAuthenticated: !!savedUser,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("ledgerUser", JSON.stringify(action.payload));
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("ledgerUser");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;