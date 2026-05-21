import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "expenses";

const defaultExpenses = [
  {
    id: 1,
    expenseNo: "EXP-001",
    date: "2026-05-09",
    category: "Rent",
    paidTo: "Office Landlord",
    amount: 15000,
    gst: 0,
    totalAmount: 15000,
    mode: "Bank",
    referenceNo: "BANK-001",
    status: "Paid",
    notes: "Office rent payment.",
  },
];

const loadExpenses = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : defaultExpenses;
};

const saveExpenses = (expenses) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
};

const expenseSlice = createSlice({
  name: "expenses",
  initialState: {
    expenses: loadExpenses(),
  },
  reducers: {
    addExpense: (state, action) => {
      state.expenses.unshift(action.payload);
      saveExpenses(state.expenses);
    },

    updateExpense: (state, action) => {
      state.expenses = state.expenses.map((expense) =>
        String(expense.id) === String(action.payload.id)
          ? action.payload
          : expense
      );
      saveExpenses(state.expenses);
    },

    deleteExpense: (state, action) => {
      state.expenses = state.expenses.filter(
        (expense) => String(expense.id) !== String(action.payload)
      );
      saveExpenses(state.expenses);
    },
  },
});

export const { addExpense, updateExpense, deleteExpense } =
  expenseSlice.actions;

export default expenseSlice.reducer;