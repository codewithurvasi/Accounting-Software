import { createSlice } from "@reduxjs/toolkit";
import { getData, saveData, STORAGE_KEYS } from "../utils/storage";

const defaultInvoices = [
  {
    id: 1,
    invoiceNo: "INV-001",
    customer: "Rahul Traders",
    amount: 25000,
    paidAmount: 25000,
    balanceAmount: 0,
    status: "Paid",
    date: "2026-05-09",
  },
  {
    id: 2,
    invoiceNo: "INV-002",
    customer: "Fashion World",
    amount: 18500,
    paidAmount: 0,
    balanceAmount: 18500,
    status: "Unpaid",
    date: "2026-05-09",
  },
  {
    id: 3,
    invoiceNo: "INV-003",
    customer: "Style Hub",
    amount: 32000,
    paidAmount: 12000,
    balanceAmount: 20000,
    status: "Partial",
    date: "2026-05-09",
  },
];

const initialState = {
  invoices: getData(STORAGE_KEYS.invoices, defaultInvoices),
};

const saveInvoices = (state) => {
  saveData(STORAGE_KEYS.invoices, state.invoices);
};

const invoiceSlice = createSlice({
  name: "invoices",
  initialState,

  reducers: {
    addInvoice: (state, action) => {
      const invoice = action.payload;

      state.invoices.unshift({
        ...invoice,
        paidAmount: Number(invoice.paidAmount || 0),
        balanceAmount: Math.max(
          Number(invoice.amount || invoice.total || 0) -
            Number(invoice.paidAmount || 0),
          0
        ),
        status: invoice.status || "Unpaid",
      });

      saveInvoices(state);
    },

    updateInvoice: (state, action) => {
      const updatedInvoice = action.payload;

      state.invoices = state.invoices.map((invoice) =>
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
      );

      saveInvoices(state);
    },

    updateInvoicePaymentStatus: (state, action) => {
      const { invoiceNo, paidAmount } = action.payload;

      const invoice = state.invoices.find(
        (inv) => inv.invoiceNo === invoiceNo
      );

      if (!invoice) return;

      const totalAmount = Number(invoice.amount || invoice.total || 0);
      const currentPaid = Number(invoice.paidAmount || 0);
      const newPaidAmount = currentPaid + Number(paidAmount || 0);

      invoice.paidAmount = newPaidAmount;
      invoice.balanceAmount = Math.max(totalAmount - newPaidAmount, 0);

      if (newPaidAmount >= totalAmount) {
        invoice.status = "Paid";
      } else if (newPaidAmount > 0) {
        invoice.status = "Partial";
      } else {
        invoice.status = "Unpaid";
      }

      saveInvoices(state);
    },

    deleteInvoice: (state, action) => {
      state.invoices = state.invoices.filter(
        (invoice) => invoice.id !== action.payload
      );

      saveInvoices(state);
    },
  },
});

export const {
  addInvoice,
  updateInvoice,
  updateInvoicePaymentStatus,
  deleteInvoice,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;