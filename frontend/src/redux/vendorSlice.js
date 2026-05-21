import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "vendors";

const defaultVendors = [
  {
    id: 1,
    name: "Textile Supplier",
    companyName: "Textile Supplier Pvt Ltd",
    email: "supplier@example.com",
    phone: "9876500000",
    gstin: "23AAAAA0000A1Z5",
    pan: "AAAAA0000A",
    billingAddress: "MP Nagar",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "462011",
    openingPayable: 42000,
    paymentTerms: "Net 30 Days",
    status: "Active",
    notes: "Main fabric supplier.",
  },
];

const getInitialVendors = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : defaultVendors;
};

const saveVendors = (vendors) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
};

const vendorSlice = createSlice({
  name: "vendors",
  initialState: {
    vendors: getInitialVendors(),
  },
  reducers: {
    addVendor: (state, action) => {
      state.vendors.unshift(action.payload);
      saveVendors(state.vendors);
    },

    updateVendor: (state, action) => {
      state.vendors = state.vendors.map((vendor) =>
        vendor.id === action.payload.id ? action.payload : vendor
      );
      saveVendors(state.vendors);
    },

    deleteVendor: (state, action) => {
      state.vendors = state.vendors.filter(
        (vendor) => vendor.id !== action.payload
      );
      saveVendors(state.vendors);
    },
  },
});

export const { addVendor, updateVendor, deleteVendor } = vendorSlice.actions;
export default vendorSlice.reducer;