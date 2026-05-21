import {
  getGstAmount,
  getInvoiceTotal,
  getTaxableAmount,
  getInvoices,
} from "./reportHelpers";

const safeParse = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const getInvoiceTaxable = (invoice) => {
  return getTaxableAmount(invoice);
};

export const getInvoiceGST = (invoice) => {
  return getGstAmount(invoice);
};

export { getInvoiceTotal };

export const getSavedInvoices = () => {
  return getInvoices();
};

export const getSavedPayments = () => {
  const keys = [
    "paymentsReceived",
    "paymentReceived",
    "customerPayments",
    "payments",
    "receipts",
  ];

  for (const key of keys) {
    const data = safeParse(key);

    if (data.length > 0) {
      console.log("✅ Payment data found in localStorage key:", key, data);
      return data;
    }
  }

  return [];
};