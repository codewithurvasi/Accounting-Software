import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addPaymentMade,
  updatePaymentMade,
  deletePaymentMade,
} from "../../redux/paymentMadeSlice";

import { updateBillPaymentStatus } from "../../redux/billSlice";
import {
  Plus,
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  RotateCcw,
} from "lucide-react";

const initialPayments = [
  {
    id: 1,
    paymentNo: "PM-001",
    vendor: "Textile Supplier Co.",
    billNo: "BILL-001",
    mode: "Bank Transfer",
    bankAccount: "HDFC Bank",
    amount: 25000,
    date: "2026-05-09",
    referenceNo: "TXN884422",
    status: "Completed",
    notes: "Payment made against purchase bill BILL-001.",
  },
  {
    id: 2,
    paymentNo: "PM-002",
    vendor: "Fabric World",
    billNo: "BILL-003",
    mode: "UPI",
    bankAccount: "UPI Account",
    amount: 12500,
    date: "2026-05-08",
    referenceNo: "UPI998877",
    status: "Partial",
    notes: "UPI payment pending confirmation.",
  },
];

const emptyForm = {
  id: null,
  paymentNo: "",
  vendor: "",
  billNo: "",
  mode: "",
  bankAccount: "",
  billAmount: 0,
paidAmount: 0,
dueAmount: 0,
  amount: "",
  date: new Date().toISOString().split("T")[0],
  referenceNo: "",
  status: "Unpaid",
  notes: "",
};

export default function PaymentsMade() {
 
  const dispatch = useDispatch();
const payments = useSelector(
  (state) => state.paymentsMade?.paymentsMade || []
);

const bills = useSelector((state) => state.bills?.bills || []);
  const [form, setForm] = useState({
    ...emptyForm,
    paymentNo: `PM-${String(initialPayments.length + 1).padStart(3, "0")}`,
  });

  const [showModal, setShowModal] = useState(false);
  const [viewPayment, setViewPayment] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const generatePaymentNo = () =>
    `PM-${String(payments.length + 1).padStart(3, "0")}`;

  const handleFromDateChange = (value) => {
    setFromDate(value);

    if (toDate && new Date(toDate) < new Date(value)) {
      setToDate(value);
    }
  };

  const handleToDateChange = (value) => {
    if (fromDate && new Date(value) < new Date(fromDate)) {
      alert("End Date cannot be before Start Date");
      return;
    }

    setToDate(value);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const searchText =
        `${payment.paymentNo} ${payment.vendor} ${payment.billNo} ${payment.mode} ${payment.referenceNo}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesMode = modeFilter === "All" || payment.mode === modeFilter;
      const matchesStatus =
        statusFilter === "All" || payment.status === statusFilter;

      const currentDate = new Date(payment.date);
      const matchesFrom = fromDate ? currentDate >= new Date(fromDate) : true;
      const matchesTo = toDate ? currentDate <= new Date(toDate) : true;

      return (
        matchesSearch &&
        matchesMode &&
        matchesStatus &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [payments, search, modeFilter, statusFilter, fromDate, toDate]);

  const calculateBillTotal = (items = []) => {
  return items.reduce((sum, item) => {
    const amount = Number(item.qty || 0) * Number(item.rate || 0);
    const gstAmount = (amount * Number(item.gst || 0)) / 100;

    return sum + amount + gstAmount;
  }, 0);
};

const handleBillSelect = (billNo) => {
  const selectedBill = bills.find(
    (bill) => String(bill.billNo) === String(billNo)
  );

  if (!selectedBill) return;

  const billTotal = calculateBillTotal(selectedBill.items);

  const alreadyPaid = Number(selectedBill.paidAmount || 0);

 const dueAmount =
  Number(selectedBill.balanceAmount) > 0
    ? Number(selectedBill.balanceAmount)
    : Math.max(billTotal - alreadyPaid, 0);

  setForm({
    ...form,
    vendor: selectedBill.vendor || "",
    billNo: selectedBill.billNo || "",
    billAmount: billTotal,
    paidAmount: alreadyPaid,
    dueAmount,
    amount: dueAmount,
  });
};

  const today = new Date().toISOString().split("T")[0];

  const paidToday = filteredPayments
    .filter((payment) => payment.date === today)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const totalPaid = filteredPayments
   .filter((payment) => payment.status === "Paid" || payment.status === "Partial")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const pendingAmount = filteredPayments
   .filter((payment) => payment.status === "Partial" || payment.status === "Unpaid")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const transactionCount = filteredPayments.length;

  const resetForm = () => {
    setForm({
      ...emptyForm,
      paymentNo: generatePaymentNo(),
    });

    setShowModal(false);
    setEditMode(false);
  };

  const resetFilters = () => {
    setSearch("");
    setModeFilter("All");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
  };

const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "status") {
    if (value === "Unpaid") {
      setForm({
        ...form,
        status: value,
        mode: "",
        amount: 0,
      });
      return;
    }

    setForm({
      ...form,
      status: value,
      mode: form.mode || "Cash",
    });
    return;
  }

  setForm({
    ...form,
    [name]: value,
  });
};

 const handleSubmit = (e) => {
  e.preventDefault();

  if (!form.billNo) {
    alert("Please select purchase bill.");
    return;
  }

  if (
    form.status !== "Unpaid" &&
    Number(form.amount || 0) <= 0
  ) {
    alert("Payment amount 0 se zyada hona chahiye.");
    return;
  }

  if (
    form.status !== "Unpaid" &&
    Number(form.amount || 0) > Number(form.dueAmount || 0)
  ) {
    alert("Payment amount remaining amount se zyada nahi ho sakta.");
    return;
  }

  const payload = {
    ...form,
    id: editMode ? form.id : Date.now(),
    amount: form.status === "Unpaid" ? 0 : Number(form.amount || 0),
    mode: form.status === "Unpaid" ? "" : form.mode,
  };

  if (editMode) {
    dispatch(updatePaymentMade(payload));
  } else {
    dispatch(addPaymentMade(payload));

    if (payload.status === "Paid" || payload.status === "Partial") {
      dispatch(
        updateBillPaymentStatus({
          billNo: payload.billNo,
          paidAmount: payload.amount,
        })
      );
    }
  }

  resetForm();
};

  const handleEdit = (payment) => {
    setForm(payment);
    setEditMode(true);
    setShowModal(true);
  };

 const handleDelete = (id) => {
  const ok = window.confirm("Are you sure you want to delete this payment?");
  if (!ok) return;

  dispatch(deletePaymentMade(id));
};

  const exportCSV = () => {
    const headers = [
      "Payment No",
      "Date",
      "Vendor",
      "Bill No",
      "Mode",
      "Bank/Cash Account",
      "Amount",
      "Reference No",
      "Status",
      "Notes",
    ];

    const rows = filteredPayments.map((payment) => [
      payment.paymentNo,
      payment.date,
      payment.vendor,
      payment.billNo,
      payment.mode,
      payment.bankAccount,
      payment.amount,
      payment.referenceNo,
      payment.status,
      payment.notes,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "payments-made.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Payments Made</h1>
          <p className="mt-2 text-slate-300">
            Record vendor payments, purchase bill settlement and bank/cash
            entries.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              ...emptyForm,
              paymentNo: generatePaymentNo(),
            });
            setEditMode(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
        >
          <Plus size={18} />
          Record Payment
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard title="Paid Today" value={`₹${paidToday}`} />
        <StatCard title="Total Paid" value={`₹${totalPaid}`} />
        <StatCard title="Pending Amount" value={`₹${pendingAmount}`} />
        <StatCard title="Transactions" value={transactionCount} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
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
              placeholder="Search payment, vendor, bill..."
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
            <label className="mb-1 block text-sm font-bold">
              Payment Mode
            </label>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              <option value="All">All</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Card">Card</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">Status</label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              <option value="All">All</option>
              <option value="Unpaid">Unpaid</option>
<option value="Partial">Partial</option>
<option value="Paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Payment History</h2>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-2 font-bold text-white"
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>

    {/* Mobile Cards */}
<div className="grid gap-4 md:hidden">
  {filteredPayments.map((payment) => (
    <div
      key={payment.id}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--text)]">
            {payment.paymentNo}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {payment.vendor}
          </p>
        </div>

        <StatusBadge status={payment.status} />
      </div>

      <div className="grid gap-2 text-sm">
        <MobileInfo label="Date" value={payment.date} />
        <MobileInfo label="Bill No" value={payment.billNo} />
        <MobileInfo label="Mode" value={payment.mode} />
        <MobileInfo label="Amount" value={`₹${payment.amount}`} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <IconButton onClick={() => setViewPayment(payment)} color="blue">
          <Eye size={16} />
        </IconButton>

        <IconButton onClick={() => handleEdit(payment)} color="yellow">
          <Pencil size={16} />
        </IconButton>

        <IconButton onClick={() => handleDelete(payment.id)} color="red">
          <Trash2 size={16} />
        </IconButton>
      </div>
    </div>
  ))}

  {filteredPayments.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
      No payments found
    </div>
  )}
</div>

{/* Desktop Table */}
<div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[1150px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Payment No</Th>
        <Th>Date</Th>
        <Th>Vendor</Th>
        <Th>Bill No</Th>
        <Th>Mode</Th>
        <Th>Amount</Th>
        <Th>Status</Th>
        <Th>Actions</Th>
      </tr>
    </thead>

    <tbody>
      {filteredPayments.map((payment) => (
        <tr
          key={payment.id}
          className="border-b border-[var(--border)] last:border-b-0"
        >
          <Td bold>{payment.paymentNo}</Td>
          <Td>{payment.date}</Td>
          <Td>{payment.vendor}</Td>
          <Td>{payment.billNo}</Td>
          <Td>{payment.mode}</Td>
          <Td bold>₹{payment.amount}</Td>
          <Td>
            <StatusBadge status={payment.status} />
          </Td>
          <Td>
            <div className="flex items-center gap-2">
              <IconButton onClick={() => setViewPayment(payment)} color="blue">
                <Eye size={16} />
              </IconButton>

              <IconButton onClick={() => handleEdit(payment)} color="yellow">
                <Pencil size={16} />
              </IconButton>

              <IconButton onClick={() => handleDelete(payment.id)} color="red">
                <Trash2 size={16} />
              </IconButton>
            </div>
          </Td>
        </tr>
      ))}

      {filteredPayments.length === 0 && (
        <tr>
          <td
            colSpan="8"
            className="px-5 py-10 text-center text-[var(--muted)]"
          >
            No payments found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


      {showModal && (
        <PaymentModal
          title={editMode ? "Edit Payment Made" : "Record Payment Made"}
          form={form}
          bills={bills}
handleBillSelect={handleBillSelect}
calculateBillTotal={calculateBillTotal}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          editMode={editMode}
        />
      )}

      {viewPayment && (
        <ViewModal payment={viewPayment} onClose={() => setViewPayment(null)} />
      )}
    </div>
  );
}

function PaymentModal({
  title,
  form,
  bills,
handleBillSelect,
calculateBillTotal,
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
              Record vendor payment against purchase bill.
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
            <Input
              label="Payment No"
              name="paymentNo"
              value={form.paymentNo}
              onChange={handleChange}
              required
            />

            <Input
              label="Payment Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />

           <div>
  <label className="mb-1 block text-sm font-bold">Purchase Bill</label>

  <select
    name="billNo"
    value={form.billNo}
    onChange={(e) => handleBillSelect(e.target.value)}
    required
    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
  >
    <option value="">Select Bill</option>

    {bills
      .filter((bill) => bill.status !== "Paid")
      .map((bill) => (
        <option key={bill.id} value={bill.billNo}>
          {bill.billNo} - {bill.vendor} - Due ₹
         {Number(bill.balanceAmount ?? calculateBillTotal(bill.items))}
        </option>
      ))}
  </select>
</div>

<Input
  label="Vendor"
  name="vendor"
  value={form.vendor}
  onChange={handleChange}
  readOnly
/>

<Input
  label="Bill Total"
  name="billAmount"
  value={form.billAmount}
  readOnly
/>

<Input
  label="Remaining Amount"
  name="dueAmount"
  value={form.dueAmount}
  readOnly
/>


           <Input
  label="Amount Paid"
  name="amount"
  type="number"
  value={form.amount}
  onChange={handleChange}
  required
  max={form.dueAmount}
/>

            <div>
              <label className="mb-1 block text-sm font-bold">
                Payment Mode
              </label>

             <select
  name="mode"
  value={form.mode}
  onChange={handleChange}
  disabled={form.status === "Unpaid"}
  required={form.status !== "Unpaid"}
  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
>
  <option value="">
    {form.status === "Unpaid" ? "No Payment" : "Select Payment Mode"}
  </option>
  <option value="Cash">Cash</option>
  <option value="UPI">UPI</option>
  <option value="Bank Transfer">Bank Transfer</option>
  <option value="Cheque">Cheque</option>
  <option value="Card">Card</option>
</select>
            </div>

            <Input
              label="Bank / Cash Account"
              name="bankAccount"
              value={form.bankAccount}
              onChange={handleChange}
              placeholder="HDFC Bank / Cash"
            />

            <Input
              label="Reference No"
              name="referenceNo"
              value={form.referenceNo}
              onChange={handleChange}
              placeholder="Txn ID / Cheque No"
            />

            <div>
              <label className="mb-1 block text-sm font-bold">Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option value="Unpaid">Unpaid</option>
<option value="Partial">Partial</option>
<option value="Paid">Paid</option>
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
              placeholder="Payment notes..."
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            />
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
              {editMode ? "Update Payment" : "Save Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewModal({ payment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Payment Made Details</h2>
            <p className="text-sm text-[var(--muted)]">
              Complete vendor payment information.
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
          <Info label="Payment No" value={payment.paymentNo} />
          <Info label="Date" value={payment.date} />
          <Info label="Vendor" value={payment.vendor} />
          <Info label="Bill No" value={payment.billNo} />
          <Info label="Payment Mode" value={payment.mode} />
          <Info label="Bank/Cash Account" value={payment.bankAccount} />
          <Info label="Amount" value={`₹${payment.amount}`} />
          <Info label="Reference No" value={payment.referenceNo} />
          <Info label="Status" value={payment.status} />
        </div>

        {payment.notes && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <h3 className="font-black">Notes</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{payment.notes}</p>
          </div>
        )}
      </div>
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
  max,
  readOnly = false,
}) {
  return (
    <div>
      {label && <label className="mb-1 block text-sm font-bold">{label}</label>}

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
      <p className="text-sm font-bold text-[var(--muted)]">{title}</p>
      <h2 className="mt-2 text-2xl font-black">{value}</h2>
    </div>
  );
}

function EffectCard({ title, text }) {
  return (
    <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{text}</p>
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
  Partial: "bg-yellow-100 text-yellow-700",
  Unpaid: "bg-red-100 text-red-700",

  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || styles.Unpaid
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

function MobileInfo({ label, value, strong }) {
  return (
    <div className="rounded-xl bg-[var(--surface-soft)] p-3">
      <p className="text-xs font-bold uppercase text-[var(--muted)]">
        {label}
      </p>

      <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}>
        {value || "-"}
      </p>
    </div>
  );
}