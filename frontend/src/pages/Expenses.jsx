import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addExpense,
  updateExpense,
  deleteExpense,
} from "../redux/expenseSlice";
import {
  Plus,
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  Wallet,
} from "lucide-react";

const emptyForm = {
  id: null,
  expenseNo: "",
  date: new Date().toISOString().split("T")[0],
  category: "",
  paidTo: "",
  amount: "",
  gst: "",
  totalAmount: "",
  mode: "Cash",
  referenceNo: "",
  status: "Paid",
  notes: "",
};

const initialExpenses = [
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
  {
    id: 2,
    expenseNo: "EXP-002",
    date: "2026-05-09",
    category: "Salary",
    paidTo: "Staff",
    amount: 50000,
    gst: 0,
    totalAmount: 50000,
    mode: "Bank",
    referenceNo: "SAL-001",
    status: "Paid",
    notes: "Monthly salary payment.",
  },
  {
    id: 3,
    expenseNo: "EXP-003",
    date: "2026-05-10",
    category: "Office Supplies",
    paidTo: "Stationery Store",
    amount: 2500,
    gst: 450,
    totalAmount: 2950,
    mode: "UPI",
    referenceNo: "UPI-8891",
    status: "Paid",
    notes: "Printer paper and office stationery.",
  },
];

export default function Expenses() {
  const dispatch = useDispatch();
const expenses = useSelector((state) => state.expenses?.expenses || []);
  const [form, setForm] = useState({
    ...emptyForm,
    expenseNo: `EXP-${String(initialExpenses.length + 1).padStart(3, "0")}`,
  });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [viewExpense, setViewExpense] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const generateExpenseNo = () =>
    `EXP-${String(expenses.length + 1).padStart(3, "0")}`;

  const handleFromDateChange = (value) => {
    setFromDate(value);
    if (toDate && new Date(toDate) < new Date(value)) setToDate(value);
  };

  const handleToDateChange = (value) => {
    if (fromDate && new Date(value) < new Date(fromDate)) {
      alert("End Date cannot be before Start Date");
      return;
    }
    setToDate(value);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const text =
        `${expense.expenseNo} ${expense.category} ${expense.paidTo} ${expense.referenceNo}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || expense.category === categoryFilter;
      const matchesMode = modeFilter === "All" || expense.mode === modeFilter;

      const expenseDate = new Date(expense.date);
      const matchesFrom = fromDate ? expenseDate >= new Date(fromDate) : true;
      const matchesTo = toDate ? expenseDate <= new Date(toDate) : true;

      return matchesSearch && matchesCategory && matchesMode && matchesFrom && matchesTo;
    });
  }, [expenses, search, categoryFilter, modeFilter, fromDate, toDate]);

  const categories = [
    "All",
    ...new Set(expenses.map((expense) => expense.category).filter(Boolean)),
  ];

  const totalExpense = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.totalAmount || 0),
    0
  );

  const totalTaxable = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const totalGst = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.gst || 0),
    0
  );

  const cashExpenses = filteredExpenses
    .filter((expense) => expense.mode === "Cash")
    .reduce((sum, expense) => sum + Number(expense.totalAmount || 0), 0);

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setModeFilter("All");
    setFromDate("");
    setToDate("");
  };

  const resetForm = () => {
    setForm({
      ...emptyForm,
      expenseNo: generateExpenseNo(),
    });
    setEditMode(false);
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedForm = {
      ...form,
      [name]: value,
    };

    if (name === "amount" || name === "gst") {
      updatedForm.totalAmount =
        Number(updatedForm.amount || 0) + Number(updatedForm.gst || 0);
    }

    setForm(updatedForm);
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  const payload = {
    ...form,
    id: editMode ? form.id : Date.now(),
    amount: Number(form.amount || 0),
    gst: Number(form.gst || 0),
    totalAmount:
      Number(form.totalAmount || 0) ||
      Number(form.amount || 0) + Number(form.gst || 0),
  };

  if (editMode) {
    dispatch(updateExpense(payload));
  } else {
    dispatch(addExpense(payload));
  }

  resetForm();
};

  const handleEdit = (expense) => {
    setForm(expense);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
  const ok = window.confirm("Are you sure you want to delete this expense?");
  if (!ok) return;

  dispatch(deleteExpense(id));
};

  const exportCSV = () => {
    const headers = [
      "Expense No",
      "Date",
      "Category",
      "Paid To",
      "Amount",
      "GST",
      "Total Amount",
      "Mode",
      "Reference No",
      "Status",
    ];

    const rows = filteredExpenses.map((expense) => [
      expense.expenseNo,
      expense.date,
      expense.category,
      expense.paidTo,
      expense.amount,
      expense.gst,
      expense.totalAmount,
      expense.mode,
      expense.referenceNo,
      expense.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "expenses.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Expenses</h1>
          <p className="mt-2 text-slate-300">
            Track business expenses, GST, payment mode and references.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              ...emptyForm,
              expenseNo: generateExpenseNo(),
            });
            setEditMode(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard title="Total Expenses" value={`₹${totalExpense}`} />
        <StatCard title="Amount" value={`₹${totalTaxable}`} />
        <StatCard title="GST Amount" value={`₹${totalGst}`} />
        <StatCard title="Cash Expenses" value={`₹${cashExpenses}`} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black">Filters</h2>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold"
          >
            <RotateCcw size={16} />
            Reset Filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
            <Search size={18} className="text-[var(--muted)]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expense..."
              className="w-full bg-transparent py-3 outline-none"
            />
          </div>

          <Input
            label="Start Date"
            type="date"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
          />

          <Input
            label="End Date"
            type="date"
            value={toDate}
            min={fromDate}
            onChange={(e) => handleToDateChange(e.target.value)}
          />

          <div>
            <label className="mb-1 block text-sm font-bold">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Payment Mode</label>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              <option value="All">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-2 font-bold text-white"
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {filteredExpenses.map((expense) => (
          <div
            key={expense.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-lg font-black">{expense.expenseNo}</h3>
                <p className="text-sm text-[var(--muted)]">{expense.date}</p>
              </div>

              <StatusBadge status={expense.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <MobileInfo label="Category" value={expense.category} />
              <MobileInfo label="Paid To" value={expense.paidTo} />
              <MobileInfo label="Amount" value={`₹${expense.amount}`} />
              <MobileInfo label="GST" value={`₹${expense.gst}`} />
              <MobileInfo label="Total" value={`₹${expense.totalAmount}`} strong />
              <MobileInfo label="Mode" value={expense.mode} />
              <MobileInfo label="Reference" value={expense.referenceNo || "-"} />
            </div>

            {expense.notes && (
              <div className="mt-3 rounded-xl bg-[var(--surface-soft)] p-3">
                <p className="text-xs font-bold uppercase text-[var(--muted)]">Notes</p>
                <p className="mt-1 text-sm">{expense.notes}</p>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2 border-t border-[var(--border)] pt-3">
              <IconButton color="blue" onClick={() => setViewExpense(expense)}>
                <Eye size={16} />
              </IconButton>

              <IconButton color="yellow" onClick={() => handleEdit(expense)}>
                <Pencil size={16} />
              </IconButton>

              <IconButton color="red" onClick={() => handleDelete(expense.id)}>
                <Trash2 size={16} />
              </IconButton>
            </div>
          </div>
        ))}

        {filteredExpenses.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-[var(--muted)]">
            No expenses found
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
        <table className="w-full min-w-[1150px] text-left">
          <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
            <tr>
              <Th>Expense No</Th>
              <Th>Date</Th>
              <Th>Category</Th>
              <Th>Paid To</Th>
              <Th>Amount</Th>
              <Th>GST</Th>
              <Th>Total</Th>
              <Th>Mode</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filteredExpenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-[var(--border)] last:border-b-0"
              >
                <Td bold>{expense.expenseNo}</Td>
                <Td>{expense.date}</Td>
                <Td>{expense.category}</Td>
                <Td>{expense.paidTo}</Td>
                <Td>₹{expense.amount}</Td>
                <Td>₹{expense.gst}</Td>
                <Td bold>₹{expense.totalAmount}</Td>
                <Td>{expense.mode}</Td>
                <Td>
                  <StatusBadge status={expense.status} />
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <IconButton color="blue" onClick={() => setViewExpense(expense)}>
                      <Eye size={16} />
                    </IconButton>

                    <IconButton color="yellow" onClick={() => handleEdit(expense)}>
                      <Pencil size={16} />
                    </IconButton>

                    <IconButton color="red" onClick={() => handleDelete(expense.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </Td>
              </tr>
            ))}

            {filteredExpenses.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="px-5 py-10 text-center text-[var(--muted)]"
                >
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ExpenseModal
          title={editMode ? "Edit Expense" : "Add Expense"}
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          editMode={editMode}
        />
      )}

      {viewExpense && (
        <ViewExpenseModal
          expense={viewExpense}
          onClose={() => setViewExpense(null)}
        />
      )}
    </div>
  );
}

function ExpenseModal({
  title,
  form,
  handleChange,
  handleSubmit,
  resetForm,
  editMode,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="text-sm text-[var(--muted)]">
              Enter complete expense details for accounting records.
            </p>
          </div>

          <button
            onClick={resetForm}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Input label="Expense No" name="expenseNo" value={form.expenseNo} onChange={handleChange} required />
            <Input label="Date" name="date" type="date" value={form.date} onChange={handleChange} required />
            <Input label="Category" name="category" value={form.category} onChange={handleChange} required placeholder="Rent / Salary / Travel" />
            <Input label="Paid To" name="paidTo" value={form.paidTo} onChange={handleChange} required />
            <Input label="Amount" name="amount" type="number" value={form.amount} onChange={handleChange} required />
            <Input label="GST Amount" name="gst" type="number" value={form.gst} onChange={handleChange} />
            <Input label="Total Amount" name="totalAmount" type="number" value={form.totalAmount} onChange={handleChange} required />

            <div>
              <label className="mb-1 block text-sm font-bold">Payment Mode</label>
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
              </select>
            </div>

            <Input label="Reference No" name="referenceNo" value={form.referenceNo} onChange={handleChange} placeholder="UPI / Bank / Voucher" />

            <div>
              <label className="mb-1 block text-sm font-bold">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Notes</label>
            <textarea
              rows="4"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Expense notes..."
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            />
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <div className="flex items-center justify-between font-black">
              <span>Total Expense Amount</span>
              <span>₹{Number(form.totalAmount || 0)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-[var(--border)] px-5 py-3 font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white"
            >
              {editMode ? "Update Expense" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewExpenseModal({ expense, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Expense Details</h2>
            <p className="text-sm text-[var(--muted)]">
              Complete expense record and payment information.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Info label="Expense No" value={expense.expenseNo} />
          <Info label="Date" value={expense.date} />
          <Info label="Category" value={expense.category} />
          <Info label="Paid To" value={expense.paidTo} />
          <Info label="Amount" value={`₹${expense.amount}`} />
          <Info label="GST Amount" value={`₹${expense.gst}`} />
          <Info label="Total Amount" value={`₹${expense.totalAmount}`} />
          <Info label="Payment Mode" value={expense.mode} />
          <Info label="Reference No" value={expense.referenceNo} />
          <Info label="Status" value={expense.status} />
        </div>

        {expense.notes && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <h3 className="font-black">Notes</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{expense.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileInfo({ label, value, strong }) {
  return (
    <div className="rounded-xl bg-[var(--surface-soft)] p-3">
      <p className="text-xs font-bold uppercase text-[var(--muted)]">{label}</p>
      <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}>
        {value || "-"}
      </p>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  min,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <input
        name={name}
        type={type}
        value={value}
        min={min}
        onChange={onChange}
        required={required}
        placeholder={placeholder || label}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[var(--muted)]">{title}</p>
        <Wallet size={20} className="text-[var(--primary)]" />
      </div>

      <h2 className="mt-2 text-2xl font-black">{value}</h2>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <h3 className="mt-1 font-black">{value || "-"}</h3>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Paid: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function IconButton({ children, onClick, color }) {
  const styles = {
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <button onClick={onClick} className={`rounded-lg p-2 ${styles[color]}`}>
      {children}
    </button>
  );
}

function Th({ children }) {
  return (
    <th className="px-5 py-4 text-left text-sm font-black uppercase">
      {children}
    </th>
  );
}

function Td({ children, bold }) {
  return <td className={`px-5 py-4 ${bold ? "font-bold" : ""}`}>{children}</td>;
}