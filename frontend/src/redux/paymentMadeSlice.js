import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "paymentsMade";

const savedPayments =
  JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const initialState = {
  paymentsMade: savedPayments,
};

const saveToLocalStorage = (payments) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
};

const paymentMadeSlice = createSlice({
  name: "paymentsMade",
  initialState,
  reducers: {
    addPaymentMade: (state, action) => {
      state.paymentsMade.unshift(action.payload);
      saveToLocalStorage(state.paymentsMade);
    },

    updatePaymentMade: (state, action) => {
      state.paymentsMade = state.paymentsMade.map((payment) =>
        String(payment.id) === String(action.payload.id)
          ? action.payload
          : payment
      );

      saveToLocalStorage(state.paymentsMade);
    },

    deletePaymentMade: (state, action) => {
      state.paymentsMade = state.paymentsMade.filter(
        (payment) => String(payment.id) !== String(action.payload)
      );

      saveToLocalStorage(state.paymentsMade);
    },
  },
});

export const {
  addPaymentMade,
  updatePaymentMade,
  deletePaymentMade,
} = paymentMadeSlice.actions;

export default paymentMadeSlice.reducer;