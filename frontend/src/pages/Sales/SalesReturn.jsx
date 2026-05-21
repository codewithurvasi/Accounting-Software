import { useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  addSalesReturn,
  updateSalesReturn,
  deleteSalesReturn,
} from "../../redux/salesReturnSlice";
import { increaseProductStock } from "../../redux/productSlice";
import {
  Plus,
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  CheckCircle,
} from "lucide-react";

const initialReturns = [
  {
    id: Date.now() + 1,
    returnNo: "SR-001",
    returnDate: "2026-05-11",
    customer: "Rahul Traders",
    invoice: "INV-001",
    reason: "Size issue",
    refundMethod: "Credit Note",
    status: "Approved",
    notes: "Customer returned wrong size items.",
    items: [
      {
        product: "Formal Shirt",
        qty: 2,
        rate: 1500,
        gst: 18,
      },
    ],
  },
  {
    id: Date.now() + 2,
    returnNo: "SR-002",
    returnDate: "2026-05-11",
    customer: "Style Hub",
    invoice: "INV-004",
    reason: "Damaged item",
    refundMethod: "Bank Refund",
    status: "Pending",
    notes: "Product damaged during delivery.",
    items: [
      {
        product: "Denim Jacket",
        qty: 1,
        rate: 2200,
        gst: 18,
      },
    ],
  },
];

const emptyForm = {
  id: null,
  returnNo: "",
  returnDate: new Date().toISOString().split("T")[0],
  customer: "",
  invoice: "",
  reason: "",
  refundMethod: "Credit Note",
  status: "Pending",
  notes: "",
  items: [
    {
      product: "",
      qty: 1,
      rate: 0,
      gst: 18,
    },
  ],
};

export default function SalesReturn() {
  const dispatch = useDispatch();
  const { invoices } = useSelector((state) => state.invoices);
  const { salesReturns: returns } = useSelector((state) => state.salesReturns);
  const [form, setForm] = useState({
    ...emptyForm,
    returnNo: `SR-${String(returns.length + 1).padStart(3, "0")}`,
  });

  const [showModal, setShowModal] = useState(false);
  const [viewReturn, setViewReturn] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [showInvoiceSearch, setShowInvoiceSearch] = useState(false);

  const calculateAmount = (items = []) =>
    items.reduce(
      (sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0),
      0,
    );

  const calculateGST = (items = []) =>
    items.reduce((sum, item) => {
      const amount = Number(item.qty || 0) * Number(item.rate || 0);
      return sum + (amount * Number(item.gst || 0)) / 100;
    }, 0);

  const generateReturnNo = () =>
    `SR-${String(returns.length + 1).padStart(3, "0")}`;

  const filteredReturns = useMemo(() => {
    return returns.filter((item) => {
      const text =
        `${item.returnNo} ${item.customer} ${item.invoice} ${item.reason}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const currentDate = new Date(item.returnDate);
      const matchesFrom = fromDate ? currentDate >= new Date(fromDate) : true;
      const matchesTo = toDate ? currentDate <= new Date(toDate) : true;

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [returns, search, statusFilter, fromDate, toDate]);

  const totalReturnValue = filteredReturns.reduce(
    (sum, item) => sum + calculateAmount(item.items) + calculateGST(item.items),
    0,
  );

  const approvedCount = filteredReturns.filter(
    (item) => item.status === "Approved",
  ).length;
  const pendingCount = filteredReturns.filter(
    (item) => item.status === "Pending",
  ).length;

  const resetForm = () => {
    setForm({
      ...emptyForm,
      returnNo: generateReturnNo(),
    });
    setEditMode(false);
    setShowModal(false);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
  };

  const filteredInvoiceOptions = invoices.filter((invoice) => {
    const text = `${invoice.invoiceNo} ${invoice.customer} ${
      invoice.customerPhone || ""
    }`.toLowerCase();

    return text.includes(invoiceSearch.toLowerCase());
  });

  const handleInvoiceSelect = (invoice) => {
    setInvoiceSearch(`${invoice.invoiceNo} - ${invoice.customer}`);
    setShowInvoiceSearch(false);

    setForm({
      ...form,
      customer: invoice.customer || "",
      invoice: invoice.invoiceNo || "",
      items:
        invoice.items?.length > 0
          ? invoice.items.map((item) => ({
            productId: item.productId || item.id || "",
              product: item.product || "",
              soldQty: item.qty || 1,
              qty: 1,
              rate: item.rate || 0,
              gst: item.gst || 0,
            }))
          : emptyForm.items,
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = value;
    setForm({ ...form, items: updated });
  };

  const addItemRow = () => {
    setForm({
      ...form,
      items: [...form.items, { product: "", qty: 1, rate: 0, gst: 18 }],
    });
  };

  const removeItemRow = (index) => {
    if (form.items.length === 1) return;
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      id: editMode ? form.id : Date.now(),
    };

   if (editMode) {
  dispatch(updateSalesReturn(payload));
} else {
  dispatch(addSalesReturn(payload));

  if (payload.status === "Approved") {
    dispatch(
     increaseProductStock(
  payload.items.map((item) => ({
    productId: item.productId,
    product: item.product,
    qty: Number(item.qty || 0),
  }))
)
    );
  }
}

    resetForm();
  };

  const handleEdit = (item) => {
    setForm({
      ...item,
      items: item.items?.length ? item.items : emptyForm.items,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this sales return?",
    );
    if (!ok) return;

    dispatch(deleteSalesReturn(id));
  };

  const handleApprove = (id) => {
    const selectedReturn = returns.find((item) => item.id === id);
    if (!selectedReturn) return;

   dispatch(
  updateSalesReturn({
    ...selectedReturn,
    status: "Approved",
  })
);

dispatch(
  increaseProductStock(
  selectedReturn.items.map((item) => ({
    productId: item.productId,
    product: item.product,
    qty: Number(item.qty || 0),
  }))
)
);
  };

  const exportCSV = () => {
    const headers = [
      "Return No",
      "Date",
      "Customer",
      "Invoice",
      "Amount",
      "GST",
      "Total",
      "Reason",
      "Refund Method",
      "Status",
    ];

    const rows = filteredReturns.map((item) => {
      const amount = calculateAmount(item.items);
      const gst = calculateGST(item.items);
      return [
        item.returnNo,
        item.returnDate,
        item.customer,
        item.invoice,
        amount,
        gst,
        amount + gst,
        item.reason,
        item.refundMethod,
        item.status,
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "sales-returns.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const formSubtotal = calculateAmount(form.items);
  const formGST = calculateGST(form.items);
  const formTotal = formSubtotal + formGST;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Sales Return</h1>
          <p className="mt-2 text-slate-300">
            Manage customer returns, credit notes, refunds, stock and accounting
            impact.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ ...emptyForm, returnNo: generateReturnNo() });
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
        >
          <Plus size={18} />
          Create Return
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard title="Total Returns" value={filteredReturns.length} />
        <StatCard title="Return Value" value={`₹${totalReturnValue}`} />
        <StatCard title="Approved" value={approvedCount} />
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

        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
            <Search size={18} className="text-[var(--muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search return, customer, invoice..."
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
            <label className="mb-1 block text-sm font-bold">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Return List</h2>

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
        {filteredReturns.map((item) => {
          const amount = calculateAmount(item.items);
          const gst = calculateGST(item.items);
          const total = amount + gst;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
                <div>
                  <h3 className="text-lg font-black">{item.returnNo}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {item.returnDate}
                  </p>
                </div>

                <StatusBadge status={item.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MobileInfo label="Customer" value={item.customer} />
                <MobileInfo label="Invoice" value={item.invoice} />
                <MobileInfo label="Refund" value={item.refundMethod} />
                <MobileInfo label="Total" value={`₹${total}`} strong />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-[var(--border)] pt-3">
                <IconButton onClick={() => setViewReturn(item)} color="blue">
                  <Eye size={16} />
                </IconButton>

                <IconButton onClick={() => handleEdit(item)} color="yellow">
                  <Pencil size={16} />
                </IconButton>

                {item.status !== "Approved" && (
                  <IconButton
                    onClick={() => handleApprove(item.id)}
                    color="green"
                  >
                    <CheckCircle size={16} />
                  </IconButton>
                )}

                <IconButton onClick={() => handleDelete(item.id)} color="red">
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          );
        })}

        {filteredReturns.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-[var(--muted)]">
            No sales return found
          </div>
        )}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
        <table className="w-full min-w-[1100px] text-left">
          <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
            <tr>
              <Th>Return No</Th>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th>Invoice</Th>
              <Th>Total</Th>
              <Th>Refund</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filteredReturns.map((item) => {
              const amount = calculateAmount(item.items);
              const gst = calculateGST(item.items);
              const total = amount + gst;

              return (
                <tr
                  key={item.id}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <Td bold>{item.returnNo}</Td>
                  <Td>{item.returnDate}</Td>
                  <Td>{item.customer}</Td>
                  <Td>{item.invoice}</Td>
                  <Td bold>₹{total}</Td>
                  <Td>{item.refundMethod}</Td>
                  <Td>
                    <StatusBadge status={item.status} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <IconButton
                        onClick={() => setViewReturn(item)}
                        color="blue"
                      >
                        <Eye size={16} />
                      </IconButton>

                      <IconButton
                        onClick={() => handleEdit(item)}
                        color="yellow"
                      >
                        <Pencil size={16} />
                      </IconButton>

                      {item.status !== "Approved" && (
                        <IconButton
                          onClick={() => handleApprove(item.id)}
                          color="green"
                        >
                          <CheckCircle size={16} />
                        </IconButton>
                      )}

                      <IconButton
                        onClick={() => handleDelete(item.id)}
                        color="red"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </Td>
                </tr>
              );
            })}

            {filteredReturns.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="px-5 py-10 text-center text-[var(--muted)]"
                >
                  No sales return found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ReturnModal
          title={editMode ? "Edit Sales Return" : "Create Sales Return"}
          form={form}
          setForm={setForm}
          handleChange={handleChange}
          handleItemChange={handleItemChange}
          addItemRow={addItemRow}
          removeItemRow={removeItemRow}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          subtotal={formSubtotal}
          gstAmount={formGST}
          total={formTotal}
          editMode={editMode}
          invoiceSearch={invoiceSearch}
          setInvoiceSearch={setInvoiceSearch}
          showInvoiceSearch={showInvoiceSearch}
          setShowInvoiceSearch={setShowInvoiceSearch}
          filteredInvoiceOptions={filteredInvoiceOptions}
          handleInvoiceSelect={handleInvoiceSelect}
        />
      )}

      {viewReturn && (
        <ViewModal
          item={viewReturn}
          onClose={() => setViewReturn(null)}
          calculateAmount={calculateAmount}
          calculateGST={calculateGST}
        />
      )}
    </div>
  );
}

function ReturnModal({
  title,
  form,
  handleChange,
  handleItemChange,
  addItemRow,
  removeItemRow,
  handleSubmit,
  resetForm,
  subtotal,
  gstAmount,
  total,
  editMode,
  invoiceSearch,
  setInvoiceSearch,
  showInvoiceSearch,
  setShowInvoiceSearch,
  filteredInvoiceOptions,
  handleInvoiceSelect,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-7xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="text-sm text-[var(--muted)]">
              Create return, refund, credit note and stock adjustment details.
            </p>
          </div>

          <button
            onClick={resetForm}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-black">Return Details</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <Input
                label="Return No"
                name="returnNo"
                value={form.returnNo}
                onChange={handleChange}
                required
              />
              <Input
                label="Return Date"
                name="returnDate"
                type="date"
                value={form.returnDate}
                onChange={handleChange}
                required
              />
              <div className="relative md:col-span-2">
                <label className="mb-1 block text-sm font-bold">
                  Customer / Invoice
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
                  {/* <Search size={17} className="text-[var(--muted)]" /> */}

                  <input
                    value={invoiceSearch}
                    onChange={(e) => {
                      setInvoiceSearch(e.target.value);
                      setShowInvoiceSearch(true);
                    }}
                    onFocus={() => setShowInvoiceSearch(true)}
                    placeholder="Customer name or invoice number"
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
                            Phone: {invoice.customerPhone || "-"} | Amount: ₹
                            {invoice.amount || 0}
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
                required
                readOnly
              />

              <Input
                label="Invoice No"
                name="invoice"
                value={form.invoice}
                onChange={handleChange}
                required
                readOnly
              />

              <div>
                <label className="mb-1 block text-sm font-bold">Reason</label>
                <select
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                >
                  <option value="">Select Reason</option>
                  <option value="Damaged item">Damaged item</option>
                  <option value="Wrong item">Wrong item</option>
                  <option value="Size issue">Size issue</option>
                  <option value="Quality issue">Quality issue</option>
                  <option value="Customer cancellation">
                    Customer cancellation
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold">
                  Refund Method
                </label>
                <select
                  name="refundMethod"
                  value={form.refundMethod}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                >
                  <option value="Credit Note">Credit Note</option>
                  <option value="Cash Refund">Cash Refund</option>
                  <option value="Bank Refund">Bank Refund</option>
                  <option value="Wallet Adjustment">Wallet Adjustment</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold">
                  Approval Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black">Return Items</h3>
              <button
                type="button"
                onClick={addItemRow}
                className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white"
              >
                + Add Item
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
              <table className="w-full min-w-[900px]">
                <thead className="bg-[var(--surface-soft)]">
                  <tr>
                    <Th>Product</Th>
                    <Th>Sold Qty</Th>
                    <Th>Return Qty</Th>
                    <Th>Balance Qty</Th>
                    <Th>Rate</Th>
                    <Th>GST %</Th>
                    <Th>Amount</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>

                <tbody>
                  {form.items.map((item, index) => {
                    const returnQty = Number(item.qty || 0);
                    const soldQty = Number(item.soldQty || 0);
                    const rate = Number(item.rate || 0);
                    const gst = Number(item.gst || 0);

                    const balanceQty = Math.max(soldQty - returnQty, 0);
                    const amount = returnQty * rate;
                    const total = amount + (amount * gst) / 100;

                    return (
                      <tr
                        key={index}
                        className="border-t border-[var(--border)]"
                      >
                        <Td>
                          <input
                            value={item.product}
                            onChange={(e) =>
                              handleItemChange(index, "product", e.target.value)
                            }
                            placeholder="Product name"
                            required
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                          />
                        </Td>

                        <Td>
                          <input
                            type="number"
                            value={item.soldQty || 0}
                            readOnly
                            className="w-28 cursor-not-allowed rounded-xl border border-[var(--border)] bg-slate-100 px-4 py-3 outline-none"
                          />
                        </Td>

                        <Td>
                          <input
                            type="number"
                            min="1"
                            max={item.soldQty || 1}
                            value={item.qty}
                            onChange={(e) =>
                              handleItemChange(index, "qty", e.target.value)
                            }
                            className="w-28 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                          />
                        </Td>

                        <Td>{balanceQty}</Td>

                        <Td>
                          <input
                            type="number"
                            min="0"
                            value={item.rate}
                            onChange={(e) =>
                              handleItemChange(index, "rate", e.target.value)
                            }
                            className="w-32 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                          />
                        </Td>

                        <Td>
                          <input
                            type="number"
                            min="0"
                            value={item.gst}
                            onChange={(e) =>
                              handleItemChange(index, "gst", e.target.value)
                            }
                            className="w-24 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                          />
                        </Td>

                        <Td bold>₹{total}</Td>

                        <Td>
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="rounded-lg bg-red-100 p-2 text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ml-auto max-w-md space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <SummaryRow label="Subtotal" value={`₹${subtotal}`} />
            <SummaryRow label="GST Adjustment" value={`₹${gstAmount}`} />
            <div className="border-t border-[var(--border)] pt-4">
              <SummaryRow label="Return Total" value={`₹${total}`} large />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Notes</label>
            <textarea
              rows="4"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Return notes..."
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
              {editMode ? "Update Return" : "Save Return"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewModal({ item, onClose, calculateAmount, calculateGST }) {
  const subtotal = calculateAmount(item.items);
  const gst = calculateGST(item.items);
  const total = subtotal + gst;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Sales Return Details</h2>
            <p className="text-sm text-[var(--muted)]">
              Complete return, refund and accounting detail.
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
          <Info label="Return No" value={item.returnNo} />
          <Info label="Return Date" value={item.returnDate} />
          <Info label="Customer" value={item.customer} />
          <Info label="Invoice No" value={item.invoice} />
          <Info label="Reason" value={item.reason} />
          <Info label="Refund Method" value={item.refundMethod} />
          <Info label="Status" value={item.status} />
          <Info label="Subtotal" value={`₹${subtotal}`} />
          <Info label="Return Total" value={`₹${total}`} />
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[var(--surface-soft)]">
              <tr>
                <Th>Product</Th>
                <Th>Qty Returned</Th>
                <Th>Rate</Th>
                <Th>GST %</Th>
                <Th>Amount</Th>
              </tr>
            </thead>

            <tbody>
              {item.items?.map((product, index) => {
                const amount =
                  Number(product.qty || 0) * Number(product.rate || 0);

                return (
                  <tr key={index} className="border-t border-[var(--border)]">
                    <Td>{product.product}</Td>
                    <Td>{item.soldQty || item.qty || 0}</Td>
                    <Td>{product.qty}</Td>
                    <Td>₹{product.rate}</Td>
                    <Td>{product.gst}%</Td>
                    <Td bold>₹{amount}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {item.notes && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <h3 className="font-black">Notes</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.notes}</p>
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
  readOnly = false,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
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
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <h3 className="mt-1 font-black">{value || "-"}</h3>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Approved: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${styles[status] || styles.Pending}`}
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
    green: "bg-green-100 text-green-700",
  };

  return (
    <button onClick={onClick} className={`rounded-lg p-2 ${styles[color]}`}>
      {children}
    </button>
  );
}

function SummaryRow({ label, value, large }) {
  return (
    <div
      className={`flex items-center justify-between ${large ? "text-xl font-black" : "font-bold"}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
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
