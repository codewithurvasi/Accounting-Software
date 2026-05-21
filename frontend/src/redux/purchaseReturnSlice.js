import { createSlice } from "@reduxjs/toolkit";

const getSavedPurchaseReturns = () => {
  try {
    return JSON.parse(localStorage.getItem("purchaseReturns") || "[]");
  } catch {
    return [];
  }
};

const savePurchaseReturns = (returns) => {
  localStorage.setItem("purchaseReturns", JSON.stringify(returns));
};

const initialState = {
  returns: getSavedPurchaseReturns(),
};

const purchaseReturnSlice = createSlice({
  name: "purchaseReturns",
  initialState,
  reducers: {
    addPurchaseReturn: (state, action) => {
      state.returns.unshift(action.payload);
      savePurchaseReturns(state.returns);
    },

    updatePurchaseReturn: (state, action) => {
      const index = state.returns.findIndex(
        (item) => item.id === action.payload.id
      );

      if (index !== -1) {
        state.returns[index] = action.payload;
        savePurchaseReturns(state.returns);
      }
    },

    deletePurchaseReturn: (state, action) => {
      state.returns = state.returns.filter(
        (item) => item.id !== action.payload
      );

      savePurchaseReturns(state.returns);
    },

    approvePurchaseReturn: (state, action) => {
      const purchaseReturn = state.returns.find(
        (item) => item.id === action.payload
      );

      if (purchaseReturn) {
        purchaseReturn.status = "Approved";
        savePurchaseReturns(state.returns);
      }
    },
  },
});

export const {
  addPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
  approvePurchaseReturn,
} = purchaseReturnSlice.actions;

export default purchaseReturnSlice.reducer;