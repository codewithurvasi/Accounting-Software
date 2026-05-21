import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "bills";

const defaultBills = [
  {
    id: 1,
    billNo: "BILL-001",
    vendor: "Textile Supplier",
    vendorBillNo: "SUP-8891",
    billDate: "2026-05-09",
    dueDate: "2026-05-25",

    status: "Unpaid",
    paymentStatus: "Unpaid",

    paidAmount: 0,
    balanceAmount: 41300,

    notes: "Fabric purchase bill.",

    items: [
      {
        product: "Cotton Fabric",
        qty: 10,
        rate: 3500,
        gst: 18,
      },
    ],
  },
];

const loadBills = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : defaultBills;
};

const saveBills = (bills) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
};

const calculateBillTotal = (items = []) => {
  return items.reduce((sum, item) => {
    const qty = Number(item.qty || 0);
    const rate = Number(item.rate || 0);
    const gst = Number(item.gst || 0);

    const amount = qty * rate;
    const gstAmount = (amount * gst) / 100;

    return sum + amount + gstAmount;
  }, 0);
};

const billSlice = createSlice({
  name: "bills",

  initialState: {
    bills: loadBills(),
  },

  reducers: {
    addBill: (state, action) => {
      const payload = {
        ...action.payload,
        paidAmount: Number(action.payload.paidAmount || 0),
      };

      const total = calculateBillTotal(payload.items);

      payload.balanceAmount = Math.max(
        total - Number(payload.paidAmount || 0),
        0
      );

      payload.status =
        payload.balanceAmount <= 0
          ? "Paid"
          : payload.paidAmount > 0
          ? "Partial"
          : "Unpaid";

      payload.paymentStatus = payload.status;

      state.bills.unshift(payload);

      saveBills(state.bills);
    },

    updateBill: (state, action) => {
      state.bills = state.bills.map((bill) => {
        if (String(bill.id) !== String(action.payload.id)) {
          return bill;
        }

        const updatedBill = {
          ...action.payload,
        };

        const total = calculateBillTotal(updatedBill.items);

        updatedBill.paidAmount = Number(
          updatedBill.paidAmount || 0
        );

        updatedBill.balanceAmount = Math.max(
          total - updatedBill.paidAmount,
          0
        );

        updatedBill.status =
          updatedBill.balanceAmount <= 0
            ? "Paid"
            : updatedBill.paidAmount > 0
            ? "Partial"
            : "Unpaid";

        updatedBill.paymentStatus = updatedBill.status;

        return updatedBill;
      });

      saveBills(state.bills);
    },

    deleteBill: (state, action) => {
      state.bills = state.bills.filter(
        (bill) => String(bill.id) !== String(action.payload)
      );

      saveBills(state.bills);
    },

    updateBillPaymentStatus: (state, action) => {
      const { billNo, paidAmount } = action.payload;

      const bill = state.bills.find(
        (bill) => String(bill.billNo) === String(billNo)
      );

      if (bill) {
        const total = calculateBillTotal(bill.items);

        const oldPaid = Number(bill.paidAmount || 0);

        const newPaid = oldPaid + Number(paidAmount || 0);

        bill.paidAmount = newPaid;

        bill.balanceAmount = Math.max(total - newPaid, 0);

        bill.status =
          bill.balanceAmount <= 0
            ? "Paid"
            : newPaid > 0
            ? "Partial"
            : "Unpaid";

        bill.paymentStatus = bill.status;

        saveBills(state.bills);
      }
    },
  },
});

export const {
  addBill,
  updateBill,
  deleteBill,
  updateBillPaymentStatus,
} = billSlice.actions;

export default billSlice.reducer;