export const STORAGE_KEYS = {
  invoices: "lp_invoices",
  customers: "lp_customers",
  vendors: "lp_vendors",
  payments: "lp_payments",
  salesReturns: "lp_sales_returns",
};

export const getData = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};