import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import invoiceReducer from "./invoiceSlice";
import customerReducer from "./customerSlice";
import paymentReducer from "./paymentSlice";
import salesReturnReducer from "./salesReturnSlice"; 
import productReducer from "./productSlice";
import vendorReducer from "./vendorSlice";
import billReducer from "./billSlice";
import purchaseReturnReducer from "./purchaseReturnSlice";
import paymentMadeReducer from "./paymentMadeSlice";
import expenseReducer from "./expenseSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    invoices: invoiceReducer,
    customers: customerReducer,
    payments: paymentReducer,
    salesReturns: salesReturnReducer,
    products: productReducer,
    vendors: vendorReducer,
    bills: billReducer,
    purchaseReturns: purchaseReturnReducer,
    paymentsMade: paymentMadeReducer,
    expenses: expenseReducer,
  },
});