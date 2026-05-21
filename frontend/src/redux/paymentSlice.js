import { createSlice } from "@reduxjs/toolkit";
import { getData, saveData, STORAGE_KEYS } from "../utils/storage";

const defaultPayments = [];

const initialState = {
  payments: getData(STORAGE_KEYS.payments, defaultPayments),
};

const savePayments = (state) => {
  saveData(STORAGE_KEYS.payments, state.payments);
};

const paymentSlice = createSlice({
  name: "payments",
  initialState,

  reducers: {
    addPayment: (state, action) => {
      state.payments.unshift(action.payload);

      savePayments(state);
    },

    updatePayment: (state, action) => {
      const updatedPayment = action.payload;

      state.payments = state.payments.map((payment) =>
        payment.id === updatedPayment.id
          ? updatedPayment
          : payment
      );

      savePayments(state);
    },

    deletePayment: (state, action) => {
      state.payments = state.payments.filter(
        (payment) => payment.id !== action.payload
      );

      savePayments(state);
    },
  },
});

export const {
  addPayment,
  updatePayment,
  deletePayment,
} = paymentSlice.actions;

export default paymentSlice.reducer;