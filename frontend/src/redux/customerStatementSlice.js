import { createSlice } from "@reduxjs/toolkit";
import { getData, saveData, STORAGE_KEYS } from "../utils/storage";

const defaultCustomerStatements = [];

const initialState = {
  customerStatements: getData(
    STORAGE_KEYS.customerStatements,
    defaultCustomerStatements
  ),
};

const saveCustomerStatements = (state) => {
  saveData(STORAGE_KEYS.customerStatements, state.customerStatements);
};

const customerStatementSlice = createSlice({
  name: "customerStatements",
  initialState,

  reducers: {
    addCustomerStatement: (state, action) => {
      state.customerStatements.unshift(action.payload);
      saveCustomerStatements(state);
    },

    updateCustomerStatement: (state, action) => {
      const updatedStatement = action.payload;

      state.customerStatements = state.customerStatements.map((statement) =>
        statement.id === updatedStatement.id ? updatedStatement : statement
      );

      saveCustomerStatements(state);
    },

    deleteCustomerStatement: (state, action) => {
      state.customerStatements = state.customerStatements.filter(
        (statement) => statement.id !== action.payload
      );

      saveCustomerStatements(state);
    },
  },
});

export const {
  addCustomerStatement,
  updateCustomerStatement,
  deleteCustomerStatement,
} = customerStatementSlice.actions;

export default customerStatementSlice.reducer;