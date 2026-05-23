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
        String(payment.id) === String(updatedPayment.id)
          ? updatedPayment
          : payment
      );

      savePayments(state);
    },

    deletePayment: (state, action) => {
      state.payments = state.payments.filter(
        (payment) => String(payment.id) !== String(action.payload)
      );

      savePayments(state);
    },

    updateAutoPaymentByInvoiceNo: (state, action) => {
      const { invoiceNo, paymentData } = action.payload;

      const index = state.payments.findIndex(
        (payment) =>
          String(payment.invoiceNo || payment.invoice) === String(invoiceNo) &&
          payment.source === "invoice"
      );

      if (index !== -1) {
        state.payments[index] = {
          ...state.payments[index],
          ...paymentData,
          source: "invoice",
        };
      } else {
        state.payments.unshift({
          id: Date.now(),
          paymentNo: `PAY-${String(state.payments.length + 1).padStart(
            3,
            "0"
          )}`,
          ...paymentData,
          source: "invoice",
        });
      }

      savePayments(state);
    },

    deletePaymentByInvoiceNo: (state, action) => {
      state.payments = state.payments.filter(
        (payment) =>
          !(
            String(payment.invoiceNo || payment.invoice) ===
              String(action.payload) && payment.source === "invoice"
          )
      );

      savePayments(state);
    },
  },
});

export const {
  addPayment,
  updatePayment,
  deletePayment,
  updateAutoPaymentByInvoiceNo,
  deletePaymentByInvoiceNo,
} = paymentSlice.actions;

export default paymentSlice.reducer;