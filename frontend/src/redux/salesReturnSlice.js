import { createSlice } from "@reduxjs/toolkit";
import { getData, saveData, STORAGE_KEYS } from "../utils/storage";

const defaultSalesReturns = [];

const initialState = {
  salesReturns: getData(
    STORAGE_KEYS.salesReturns,
    defaultSalesReturns
  ),
};

const saveSalesReturns = (state) => {
  saveData(
    STORAGE_KEYS.salesReturns,
    state.salesReturns
  );
};

const salesReturnSlice = createSlice({
  name: "salesReturns",

  initialState,

  reducers: {
    addSalesReturn: (state, action) => {
      state.salesReturns.unshift(action.payload);

      saveSalesReturns(state);
    },

    updateSalesReturn: (state, action) => {
      const updatedReturn = action.payload;

      state.salesReturns = state.salesReturns.map((saleReturn) =>
        saleReturn.id === updatedReturn.id
          ? updatedReturn
          : saleReturn
      );

      saveSalesReturns(state);
    },

    deleteSalesReturn: (state, action) => {
      state.salesReturns = state.salesReturns.filter(
        (saleReturn) => saleReturn.id !== action.payload
      );

      saveSalesReturns(state);
    },
  },
});

export const {
  addSalesReturn,
  updateSalesReturn,
  deleteSalesReturn,
} = salesReturnSlice.actions;

export default salesReturnSlice.reducer;