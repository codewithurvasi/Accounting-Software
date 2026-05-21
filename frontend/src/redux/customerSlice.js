import { createSlice } from "@reduxjs/toolkit";
import { getData, saveData, STORAGE_KEYS } from "../utils/storage";

const defaultCustomers = [
  {
    id: 1,
    name: "Rahul Sharma",
    companyName: "ABC Traders",
    email: "rahul@abctraders.com",
    phone: "9876543210",
    gstin: "23ABCDE1234F1Z5",
    pan: "ABCDE1234F",
    billingAddress: "MP Nagar, Bhopal",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "462011",
    openingBalance: 25000,
    balance: 25000,
    balanceType: "Debit",
    creditLimit: 50000,
    paymentTerms: "Net 30 Days",
    status: "Active",
    notes: "Regular customer",
  },

  {
    id: 2,
    name: "Neha Verma",
    companyName: "Metro Sales",
    email: "neha@metrosales.com",
    phone: "9988776655",
    gstin: "27ABCDE5678K1Z2",
    pan: "ABCDE5678K",
    billingAddress: "Andheri East, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400069",
    openingBalance: 12000,
    balance: 12000,
    balanceType: "Debit",
    creditLimit: 30000,
    paymentTerms: "Net 15 Days",
    status: "Active",
    notes: "GST customer",
  },
];

const initialState = {
  customers: getData(
    STORAGE_KEYS.customers,
    defaultCustomers
  ),
};

const saveCustomers = (state) => {
  saveData(STORAGE_KEYS.customers, state.customers);
};

const customerSlice = createSlice({
  name: "customers",

  initialState,

  reducers: {
    addCustomer: (state, action) => {
      state.customers.unshift(action.payload);

      saveCustomers(state);
    },

    updateCustomer: (state, action) => {
      const updatedCustomer = action.payload;

      state.customers = state.customers.map((customer) =>
        customer.id === updatedCustomer.id
          ? updatedCustomer
          : customer
      );

      saveCustomers(state);
    },

    deleteCustomer: (state, action) => {
      state.customers = state.customers.filter(
        (customer) => customer.id !== action.payload
      );

      saveCustomers(state);
    },
  },
});

export const {
  addCustomer,
  updateCustomer,
  deleteCustomer,
} = customerSlice.actions;

export default customerSlice.reducer;