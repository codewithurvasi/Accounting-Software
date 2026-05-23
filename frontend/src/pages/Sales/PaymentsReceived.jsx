import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addPayment,
  deletePayment,
} from "../../redux/paymentSlice";
import { updateInvoicePaymentStatus, updateInvoice } from "../../redux/invoiceSlice";
import {
  Plus,
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  Printer,
} from "lucide-react";

const initialPayments = [
  {
    id: Date.now() + 1,
    paymentNo: "PAY-001",
    customer: "Rahul Traders",
    invoice: "INV-001",
    mode: "Bank Transfer",
    bankAccount: "HDFC Bank",
    amount: 18500,
    date: "2026-05-09",
    referenceNo: "TXN987654",
    status: "Reconciled",
    notes: "Payment received against INV-001.",
  },
  {
    id: Date.now() + 2,
    paymentNo: "PAY-002",
    customer: "Style Hub",
    invoice: "INV-003",
    mode: "UPI",
    bankAccount: "UPI Account",
    amount: 7200,
    date: "2026-05-08",
    referenceNo: "UPI456789",
    status: "Pending",
    notes: "UPI payment received.",
  },
];

const emptyForm = {
  id: null,
  paymentNo: "",
  customer: "",
  invoice: "",
  invoiceAmount: 0,
  paidAmount: 0,
  remainingAmount: 0,
  currentPayment: "",
  mode: "",
  bankAccount: "",
  date: new Date().toISOString().split("T")[0],
  dueDate: "",
  referenceNo: "",
  status: "Pending",
  notes: "",
};

export default function PaymentsReceived() {
  const dispatch = useDispatch();
  const { payments } = useSelector((state) => state.payments);
  const { invoices } = useSelector((state) => state.invoices);

  const getInvoiceStatus = (paidAmount, invoiceAmount) => {
  if (Number(paidAmount || 0) >= Number(invoiceAmount || 0)) return "Paid";
  if (Number(paidAmount || 0) > 0) return "Partial";
  return "Unpaid";
};
  
  const [form, setForm] = useState({
    ...emptyForm,
    paymentNo: `PAY-${String(initialPayments.length + 1).padStart(3, "0")}`,
  });

  const [showModal, setShowModal] = useState(false);
  const [viewPayment, setViewPayment] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [showInvoiceSearch, setShowInvoiceSearch] = useState(false);

  const generatePaymentNo = () =>
    `PAY-${String(payments.length + 1).padStart(3, "0")}`;

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const searchText =
        `${payment.paymentNo} ${payment.customer} ${payment.invoice} ${payment.mode} ${payment.referenceNo}`.toLowerCase();

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

  {
    form.invoice && (
      <div className="md:col-span-4 grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 md:grid-cols-5">
        <Info label="Invoice Amount" value={`₹${form.invoiceAmount || 0}`} />
        <Info label="Already Paid" value={`₹${form.paidAmount || 0}`} />
        <Info label="Remaining" value={`₹${form.remainingAmount || 0}`} />
        <Info label="Current Amount" value={`₹${form.currentPayment || 0}`} />
        <Info label="Due Date" value={form.dueDate || "-"} />
      </div>
    );
  }

  const totalReceived = filteredPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );

  const today = new Date().toISOString().split("T")[0];

  const receivedToday = filteredPayments
    .filter((payment) => payment.date === today)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const reconciledCount = filteredPayments.filter(
    (payment) => payment.status === "Reconciled",
  ).length;

  const pendingCount = filteredPayments.filter(
    (payment) => payment.status === "Pending",
  ).length;

  const filteredInvoiceOptions = invoices.filter((invoice) => {
    const text =
      `${invoice.invoiceNo} ${invoice.customer} ${invoice.customerPhone || ""}`.toLowerCase();
    return text.includes(invoiceSearch.toLowerCase());
  });

  const handleInvoiceSelect = (invoice) => {
    const invoiceAmount = Number(invoice.amount || invoice.total || 0);
    const paidAmount = Number(invoice.paidAmount || 0);
    const remainingAmount =
      invoice.balanceAmount !== undefined && invoice.balanceAmount !== null
        ? Number(invoice.balanceAmount)
        : Math.max(invoiceAmount - paidAmount, 0);
    setInvoiceSearch(`${invoice.invoiceNo} - ${invoice.customer}`);
    setShowInvoiceSearch(false);

    setForm({
      ...form,
      invoice: invoice.invoiceNo,
      customer: invoice.customer,
      invoiceAmount,
      paidAmount,
      remainingAmount,
      balanceAfterPayment: remainingAmount,
      currentPayment: remainingAmount > 0 ? remainingAmount : "",
      mode: "",
      bankAccount: "",
      dueDate: invoice.dueDate || "",
      status:
        remainingAmount <= 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Pending",
      notes: `Payment received against ${invoice.invoiceNo}`,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "status") {
      const remainingAmount = Number(form.remainingAmount || 0);

      setForm({
        ...form,
        status: value,

        currentPayment:
          value === "Paid" ? remainingAmount : value === "Partial" ? "" : "",

        amount: value === "Paid" ? remainingAmount : "",

        balanceAfterPayment: value === "Paid" ? 0 : remainingAmount,

        mode: value === "Pending" ? "" : form.mode,
        bankAccount: value === "Pending" ? "" : form.bankAccount,
        referenceNo: value === "Pending" ? "" : form.referenceNo,
      });

      return;
    }

    if (name === "currentPayment") {
      const payNow = Number(value || 0);
      const remainingAmount = Number(form.remainingAmount || 0);
      const balanceAfterPayment = Math.max(remainingAmount - payNow, 0);

      setForm({
        ...form,
        currentPayment: value,
        amount: payNow,
        balanceAfterPayment,
        status:
          payNow >= remainingAmount
            ? "Paid"
            : payNow > 0
              ? "Partial"
              : "Pending",
      });

      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

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

const handleSubmit = (e) => {
  e.preventDefault();

  const currentPayment = Number(form.currentPayment || 0);

  if (!form.invoice || !form.customer) {
    alert("Invoice/customer select karo.");
    return;
  }

  if (currentPayment <= 0) {
    alert("Current payment amount enter karo.");
    return;
  }

  if (!form.mode) {
    alert("Please select payment mode.");
    return;
  }

  if (currentPayment > Number(form.remainingAmount || 0)) {
    alert("Payment remaining amount se zyada nahi ho sakta.");
    return;
  }

  const payload = {
    ...form,
    id: editMode ? form.id : Date.now(),
    invoiceNo: form.invoice,
    amount: currentPayment,
    source: "manual-payment",
    balanceAfterPayment: Math.max(
      Number(form.remainingAmount || 0) - currentPayment,
      0
    ),
  };

  dispatch(addPayment(payload));

  dispatch(
    updateInvoicePaymentStatus({
      invoiceNo: form.invoice,
      paidAmount: currentPayment,
    })
  );

  resetForm();
};

  const handleEdit = (payment) => {
    const relatedInvoice = invoices.find(
      (invoice) => invoice.invoiceNo === payment.invoice,
    );

    const invoiceAmount = Number(
      relatedInvoice?.amount ||
        relatedInvoice?.total ||
        payment.invoiceAmount ||
        0,
    );

    const previousPaid = Number(
      relatedInvoice?.paidAmount || payment.paidAmount || 0,
    );

    const oldRemaining =
      relatedInvoice?.balanceAmount !== undefined &&
      relatedInvoice?.balanceAmount !== null
        ? Number(relatedInvoice.balanceAmount)
        : Math.max(invoiceAmount - previousPaid, 0);

    setInvoiceSearch(`${payment.invoice} - ${payment.customer}`);

    setForm({
      ...payment,
      invoiceAmount,
      paidAmount: previousPaid,
      remainingAmount: oldRemaining,
      currentPayment: "",
      balanceAfterPayment: oldRemaining,
      mode: "",
      bankAccount: "",
      referenceNo: "",
      status: oldRemaining <= 0 ? "Paid" : "Pending",
    });

    setEditMode(true);
    setShowModal(true);
  };

const handleDelete = (payment) => {
  const ok = window.confirm("Are you sure you want to delete this payment?");
  if (!ok) return;

  const relatedInvoice = invoices.find(
    (invoice) =>
      String(invoice.invoiceNo) === String(payment.invoiceNo || payment.invoice)
  );

  if (relatedInvoice) {
    const invoiceAmount = Number(relatedInvoice.amount || relatedInvoice.total || 0);

    const newPaidAmount = Math.max(
      Number(relatedInvoice.paidAmount || 0) - Number(payment.amount || 0),
      0
    );

    const newBalanceAmount = Math.max(invoiceAmount - newPaidAmount, 0);

    const newStatus = getInvoiceStatus(newPaidAmount, invoiceAmount);

    dispatch(
      updateInvoice({
        ...relatedInvoice,
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        status: newStatus,
        paymentStatus: newStatus,
      })
    );
  }

  dispatch(deletePayment(payment.id));
};

  const exportCSV = () => {
    const headers = [
      "Payment No",
      "Date",
      "Customer",
      "Invoice",
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
      payment.customer,
      payment.invoice,
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
    link.download = "payments-received.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Payments Received</h1>
          <p className="mt-2 text-slate-300">
            Record customer payments, invoice settlement and bank/cash entries.
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
        <StatCard title="Received Today" value={`₹${receivedToday}`} />
        <StatCard title="Total Received" value={`₹${totalReceived}`} />
        <StatCard title="Reconciled" value={reconciledCount} />
        <StatCard title="Pending" value={pendingCount} />
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
              placeholder="Search payment, customer, invoice..."
              className="w-full bg-transparent py-3 outline-none"
            />
          </div>

          <Input
            label="Start Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <Input
            label="End Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          <div>
            <label className="mb-1 block text-sm font-bold">Payment Mode</label>

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
              <option value="Pending">Pending</option>
              <option value="Reconciled">Reconciled</option>
              <option value="Cancelled">Cancelled</option>
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

      {/* MOBILE CARD VIEW */}
      <div className="grid gap-4 md:hidden">
        {filteredPayments.map((payment) => (
          <div
            key={payment.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-lg font-black">{payment.paymentNo}</h3>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  {payment.date}
                </p>
              </div>

              <StatusBadge status={payment.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MobileInfo label="Customer" value={payment.customer} />

              <MobileInfo label="Invoice" value={payment.invoice} />

              <MobileInfo label="Mode" value={payment.mode} />

              <MobileInfo label="Amount" value={`₹${payment.amount}`} strong />
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-[var(--border)] pt-3">
              <IconButton onClick={() => setViewPayment(payment)} color="blue">
                <Eye size={16} />
              </IconButton>

              <IconButton onClick={() => handleEdit(payment)} color="yellow">
                <Pencil size={16} />
              </IconButton>

              <IconButton onClick={() => handleDelete(payment)} color="red">
                <Trash2 size={16} />
              </IconButton>
            </div>
          </div>
        ))}

        {filteredPayments.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-[var(--muted)]">
            No payments found
          </div>
        )}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
        <table className="w-full min-w-[1150px] text-left">
          <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
            <tr>
              <Th>Payment No</Th>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th>Invoice</Th>
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
                <Td>{payment.customer}</Td>
                <Td>{payment.invoice}</Td>
                <Td>{payment.mode}</Td>
                <Td bold>₹{payment.amount}</Td>

                <Td>
                  <StatusBadge status={payment.status} />
                </Td>

                <Td>
                  <div className="flex items-center gap-2">
                    <IconButton
                      onClick={() => setViewPayment(payment)}
                      color="blue"
                    >
                      <Eye size={16} />
                    </IconButton>
                    
              {/* <IconButton
                onClick={() => handleEdit(payment)}
                color="yellow"
              >
                <Pencil size={16} />
              </IconButton> */}

                    <IconButton
                     onClick={() => handleDelete(payment)}
                      color="red"
                    >
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
          title={editMode ? "Edit Payment" : "Record Payment"}
          form={form}
          handleChange={handleChange}
          invoiceSearch={invoiceSearch}
          setInvoiceSearch={setInvoiceSearch}
          showInvoiceSearch={showInvoiceSearch}
          setShowInvoiceSearch={setShowInvoiceSearch}
          filteredInvoiceOptions={filteredInvoiceOptions}
          handleInvoiceSelect={handleInvoiceSelect}
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
  handleChange,
  invoiceSearch,
  setInvoiceSearch,
  showInvoiceSearch,
  setShowInvoiceSearch,
  filteredInvoiceOptions,
  handleInvoiceSelect,
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
              Record customer payment against invoice.
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
            {/* 
            <Input
  label="Customer"
  name="customer"
  value={form.customer}
  onChange={handleChange}
  required
  readOnly
/>

           <div>
  <label className="mb-1 block text-sm font-bold">Invoice No</label>

  <select
    name="invoice"
    value={form.invoice}
    onChange={handleInvoiceChange}
    required
    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
  >
    <option value="">Select Invoice</option>

    {invoices.map((invoice) => (
      <option key={invoice.id} value={invoice.invoiceNo}>
        {invoice.invoiceNo} - {invoice.customer} - ₹
        {invoice.balanceAmount || invoice.amount}
      </option>
    ))}
  </select>
</div> */}

            <div className="relative md:col-span-2">
              <label className="mb-1 block text-sm font-bold">
                Search Invoice / Customer
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
                

                <input
                  value={invoiceSearch}
                  onChange={(e) => {
                    setInvoiceSearch(e.target.value);
                    setShowInvoiceSearch(true);
                  }}
                  onFocus={() => setShowInvoiceSearch(true)}
                  placeholder="Enter Invoice no or customer name"
                  className="w-full bg-transparent py-3 outline-none"
                />
              </div>

              {showInvoiceSearch && invoiceSearch && (
                <div className="absolute left-0 right-0 top-[74px] z-[90] max-h-72 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
                  {filteredInvoiceOptions.length > 0 ? (
                    filteredInvoiceOptions.map((invoice) => (
                      <button
                        key={invoice.id}
                        type="button"
                        onClick={() => handleInvoiceSelect(invoice)}
                        className="w-full border-b border-[var(--border)] px-4 py-3 text-left hover:bg-[var(--surface-soft)]"
                      >
                        <p className="font-black">
                          {invoice.invoiceNo} - {invoice.customer}
                        </p>
                        <p className="text-sm text-[var(--muted)]">
                          Paid: ₹{invoice.paidAmount || 0} | Remaining: ₹
                          {invoice.balanceAmount || invoice.amount || 0}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-[var(--muted)]">
                      No invoice found
                    </div>
                  )}
                </div>
              )}
            </div>

            <Input
              label="Customer"
              name="customer"
              value={form.customer}
              onChange={handleChange}
              readOnly
            />

            <Input
              label="Invoice No"
              name="invoice"
              value={form.invoice}
              onChange={handleChange}
              readOnly
            />

            <Input
              label="Previous Paid"
              name="paidAmount"
              type="number"
              value={form.paidAmount}
              onChange={handleChange}
              readOnly
            />

            <Input
              label="Old Remaining"
              name="remainingAmount"
              type="number"
              value={form.remainingAmount}
              onChange={handleChange}
              readOnly
            />

            {/* <Input
  label="Old Remaining"
  name="remainingAmount"
  type="number"
  value={form.remainingAmount}
  onChange={handleChange}
  readOnly
/> */}
            {form.status !== "Pending" && (
              <Input
                label={
                  form.status === "Partial" ? "Pay Now" : "Current Payment"
                }
                name="currentPayment"
                type="number"
                value={form.currentPayment}
                onChange={handleChange}
                required
              />
            )}

            <Input
              label="Balance After Payment"
              name="balanceAfterPayment"
              type="number"
              value={form.balanceAfterPayment || 0}
              onChange={handleChange}
              readOnly
            />

            <div>
              <label className="mb-1 block text-sm font-bold">
                Payment Mode
              </label>

              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                disabled={form.status === "Pending"}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Select Mode</option>
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
                <option value="Pending">Pending</option>
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
  const printReceipt = () => {
    const printContent = document.getElementById("payment-receipt-print");

    const printWindow = window.open("", "", "width=900,height=700");

    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, sans-serif; }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const receivedAmount = Number(payment.amount || payment.currentPayment || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div
          id="payment-receipt-print"
          className="mx-auto max-w-3xl border border-slate-800 bg-white p-8 text-slate-900"
        >
          <div className="border-b border-slate-800 pb-4 text-center">
            <h1 className="text-2xl font-black uppercase">
              Payment Receipt
            </h1>
            <p className="mt-1 text-sm">
              Receipt No: <b>{payment.paymentNo}</b>
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <p>
              <b>Payment No:</b> {payment.paymentNo}
            </p>
            <p>
              <b>Date:</b> {payment.date}
            </p>
            <p>
              <b>Customer:</b> {payment.customer}
            </p>
            <p>
              <b>Invoice No:</b> {payment.invoice}
            </p>
          </div>

          <table className="mt-5 w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-400 px-4 py-2 text-left">
                  Particular
                </th>
                <th className="border border-slate-400 px-4 py-2 text-right">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border border-slate-300 px-4 py-2">
                  Invoice Amount
                </td>
                <td className="border border-slate-300 px-4 py-2 text-right">
                  ₹{payment.invoiceAmount || 0}
                </td>
              </tr>

              <tr>
                <td className="border border-slate-300 px-4 py-2">
                  Previous Paid
                </td>
                <td className="border border-slate-300 px-4 py-2 text-right">
                  ₹{payment.paidAmount || 0}
                </td>
              </tr>

              <tr>
                <td className="border border-slate-300 px-4 py-2">
                  Old Remaining
                </td>
                <td className="border border-slate-300 px-4 py-2 text-right">
                  ₹{payment.remainingAmount || 0}
                </td>
              </tr>

              <tr>
                <td className="border border-slate-300 px-4 py-2">
                  Current Payment
                </td>
                <td className="border border-slate-300 px-4 py-2 text-right font-black">
                  ₹{receivedAmount}
                </td>
              </tr>

              <tr>
                <td className="border border-slate-300 px-4 py-2">
                  Balance After Payment
                </td>
                <td className="border border-slate-300 px-4 py-2 text-right">
                  ₹{payment.balanceAfterPayment || 0}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-5 flex justify-between border-2 border-slate-900 px-4 py-3 text-lg font-black">
            <span>Amount Received</span>
            <span>₹{receivedAmount}</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <p>
              <b>Payment Mode:</b> {payment.mode || "-"}
            </p>
            <p>
              <b>Bank / Cash:</b> {payment.bankAccount || "-"}
            </p>
            <p>
              <b>Reference No:</b> {payment.referenceNo || "-"}
            </p>
            <p>
              <b>Status:</b> {payment.status || "-"}
            </p>
            <p>
              <b>Due Date:</b> {payment.dueDate || "-"}
            </p>
          </div>

          {payment.notes && (
            <div className="mt-5 border-t border-slate-300 pt-4 text-sm">
              <p className="font-black">Notes:</p>
              <p className="mt-1">{payment.notes}</p>
            </div>
          )}

          <div className="mt-12 flex justify-between text-sm">
            <div>
              <p className="font-black">Received From</p>
              <p className="mt-2">{payment.customer}</p>
            </div>

            <div className="text-right">
              <div className="mb-2 w-48 border-b border-slate-800"></div>
              <p className="font-black">Authorized Signature</p>
            </div>
          </div>
        </div>

        <div className="no-print mt-5 flex justify-end gap-3 border-t pt-5">
          <button
            onClick={printReceipt}
            className="rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white"
          >
            Print Receipt
          </button>

          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-3 font-bold"
          >
            Close
          </button>
        </div>
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
  readOnly = false,
}) {
  return (
    <div>
      {label && <label className="mb-1 block text-sm font-bold">{label}</label>}

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none ${
          readOnly
            ? "cursor-not-allowed bg-slate-100 text-slate-500"
            : "bg-[var(--surface-soft)]"
        }`}
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
    <div className="box rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <h3 className="mt-1 font-black">{value || "-"}</h3>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Reconciled: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || styles.Pending
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
      <p className="text-xs font-bold uppercase text-[var(--muted)]">{label}</p>

      <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}>
        {value || "-"}
      </p>
    </div>
  );
}
