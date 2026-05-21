import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
  approvePurchaseReturn,
} from "../../redux/purchaseReturnSlice";
import { reduceProductStock } from "../../redux/productSlice";
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

const emptyForm = {
  id: null,
  returnNo: "",
  vendor: "",
  billNo: "",
  returnDate: new Date().toISOString().split("T")[0],
  reason: "",
  refundMethod: "Debit Note",
  status: "Pending",
  notes: "",
  items: [],
};

export default function PurchaseReturn() {
  const dispatch = useDispatch();

  const returns = useSelector((state) => state.purchaseReturns?.returns || []);
  useEffect(() => {
  localStorage.setItem("purchaseReturns", JSON.stringify(returns));
}, [returns]);
  const products = useSelector((state) => state.products?.products || []);
  const bills = useSelector((state) => state.bills?.bills || []);

  const [form, setForm] = useState({
    ...emptyForm,
    returnNo: `PR-${String(returns.length + 1).padStart(3, "0")}`,
  });

  const [showModal, setShowModal] = useState(false);
  const [viewReturn, setViewReturn] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [billSearch, setBillSearch] = useState("");
  const [showBillSearch, setShowBillSearch] = useState(false);

  const calculateSubtotal = (items = []) =>
    items.reduce(
      (sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0),
      0
    );

  const calculateGST = (items = []) =>
    items.reduce((sum, item) => {
      const amount = Number(item.qty || 0) * Number(item.rate || 0);
      return sum + (amount * Number(item.gst || 0)) / 100;
    }, 0);

  const calculateTotal = (items = []) =>
    calculateSubtotal(items) + calculateGST(items);

  const generateReturnNo = () =>
    `PR-${String(returns.length + 1).padStart(3, "0")}`;

  const filteredBillOptions = bills.filter((bill) => {
    const text = `${bill.billNo} ${bill.vendor} ${
      bill.vendorBillNo || ""
    }`.toLowerCase();

    return text.includes(billSearch.toLowerCase());
  });

 const handleBillSelect = (bill) => {
  setBillSearch(`${bill.billNo} - ${bill.vendor}`);
  setShowBillSearch(false);

  setForm({
    ...form,
    vendor: bill.vendor || "",
    billNo: bill.billNo || "",
    items:
      bill.items?.length > 0
        ? bill.items.map((item) => ({
  productId: item.productId || item.id || "",
  product:
    item.product ||
    item.productName ||
    item.name ||
    item.itemName ||
    "",

            purchasedQty: Number(item.qty || item.quantity || 0),

            qty: 1,

            rate: Number(item.rate || item.price || item.purchasePrice || 0),

            gst: Number(item.gst || item.taxRate || 0),
          }))
        : [],
  });
};

  const filteredReturns = useMemo(() => {
    return returns.filter((item) => {
      const text =
        `${item.returnNo} ${item.vendor} ${item.billNo} ${item.reason}`.toLowerCase();

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
    (sum, item) => sum + calculateTotal(item.items),
    0
  );

  const approvedCount = filteredReturns.filter(
    (item) => item.status === "Approved"
  ).length;

  const pendingCount = filteredReturns.filter(
    (item) => item.status === "Pending"
  ).length;

  const rejectedCount = filteredReturns.filter(
    (item) => item.status === "Rejected"
  ).length;

  const resetForm = () => {
    setForm({
      ...emptyForm,
      returnNo: generateReturnNo(),
    });
    setBillSearch("");
    setEditMode(false);
    setShowModal(false);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][field] = value;
    setForm({ ...form, items: updatedItems });
  };

  const addItemRow = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { product: "", purchasedQty: 0, qty: 1, rate: 0, gst: 18 },
      ],
    });
  };

  const removeItemRow = (index) => {
    if (form.items.length === 1) return;

    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

 const decreaseProductStock = (items = []) => {
  dispatch(
    reduceProductStock(
      items.map((item) => ({
        productId: item.productId,
        product: item.product,
        qty: Number(item.qty || 0),
      }))
    )
  );
};

  const handleSubmit = (e) => {
    e.preventDefault();

    const invalidItem = form.items.find(
      (item) =>
        !item.product ||
        Number(item.qty || 0) <= 0 ||
        Number(item.qty || 0) > Number(item.purchasedQty || 0)
    );

    if (invalidItem) {
      alert(
        "Return qty 0 nahi ho sakti aur purchased qty se zyada nahi honi chahiye."
      );
      return;
    }

    const payload = {
  ...form,
  id: editMode ? form.id : Date.now(),
  subtotal: calculateSubtotal(form.items),
  gstAmount: calculateGST(form.items),
  total: calculateTotal(form.items),
  returnDate: form.returnDate || new Date().toISOString().split("T")[0],
};

    if (editMode) {
      dispatch(updatePurchaseReturn(payload));
    } else {
      dispatch(addPurchaseReturn(payload));
    }

    if (payload.status === "Approved") {
      decreaseProductStock(payload.items);
    }

    resetForm();
  };

  const handleEdit = (item) => {
    setForm({
      ...item,
      items: item.items?.length ? item.items : emptyForm.items,
    });

    setBillSearch(`${item.billNo} - ${item.vendor}`);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this purchase return?"
    );
    if (!ok) return;

    dispatch(deletePurchaseReturn(id));
  };

  const handleApprove = (id) => {
    const selectedReturn = returns.find((item) => item.id === id);
    if (!selectedReturn) return;

    decreaseProductStock(selectedReturn.items);
    dispatch(approvePurchaseReturn(id));
  };

  const exportCSV = () => {
    const headers = [
      "Return No",
      "Date",
      "Vendor",
      "Bill No",
      "Subtotal",
      "GST",
      "Total",
      "Reason",
      "Refund Method",
      "Status",
    ];

    const rows = filteredReturns.map((item) => [
      item.returnNo,
      item.returnDate,
      item.vendor,
      item.billNo,
      calculateSubtotal(item.items),
      calculateGST(item.items),
      calculateTotal(item.items),
      item.reason,
      item.refundMethod,
      item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "purchase-returns.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const formSubtotal = calculateSubtotal(form.items);
  const formGST = calculateGST(form.items);
  const formTotal = formSubtotal + formGST;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Purchase Return</h1>
          <p className="mt-2 text-slate-300">
            Manage returned purchase items, debit notes, vendor adjustments and
            stock impact.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ ...emptyForm, returnNo: generateReturnNo() });
            setBillSearch("");
            setEditMode(false);
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
        <StatCard
          title="Pending / Rejected"
          value={pendingCount + rejectedCount}
        />
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
              placeholder="Search return, vendor, bill..."
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
            min={fromDate}
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
        <h2 className="text-xl font-black">Purchase Return List</h2>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-2 font-bold text-white"
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
        <table className="w-full min-w-[1150px] text-left">
          <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
            <tr>
              <Th>Return No</Th>
              <Th>Date</Th>
              <Th>Vendor</Th>
              <Th>Bill No</Th>
              <Th>Total</Th>
              <Th>Reason</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filteredReturns.map((item) => (
              <tr
                key={item.id}
                className="border-b border-[var(--border)] last:border-b-0"
              >
                <Td bold>{item.returnNo}</Td>
                <Td>{item.returnDate}</Td>
                <Td>{item.vendor}</Td>
                <Td>{item.billNo}</Td>
                <Td bold>₹{calculateTotal(item.items)}</Td>
                <Td>{item.reason}</Td>
                <Td>
                  <StatusBadge status={item.status} />
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <IconButton color="blue" onClick={() => setViewReturn(item)}>
                      <Eye size={16} />
                    </IconButton>

                    <IconButton color="yellow" onClick={() => handleEdit(item)}>
                      <Pencil size={16} />
                    </IconButton>

                    {item.status !== "Approved" && (
                      <IconButton
                        color="green"
                        onClick={() => handleApprove(item.id)}
                      >
                        <CheckCircle size={16} />
                      </IconButton>
                    )}

                    <IconButton color="red" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </Td>
              </tr>
            ))}

            {filteredReturns.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="px-5 py-10 text-center text-[var(--muted)]"
                >
                  No purchase returns found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ReturnModal
          title={editMode ? "Edit Purchase Return" : "Create Purchase Return"}
          form={form}
          handleChange={handleChange}
          handleItemChange={handleItemChange}
          addItemRow={addItemRow}
          removeItemRow={removeItemRow}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          subtotal={formSubtotal}
          gstAmount={formGST}
          total={formTotal}
          billSearch={billSearch}
          setBillSearch={setBillSearch}
          showBillSearch={showBillSearch}
          setShowBillSearch={setShowBillSearch}
          filteredBillOptions={filteredBillOptions}
          handleBillSelect={handleBillSelect}
        />
      )}

      {viewReturn && (
        <ViewModal
          item={viewReturn}
          onClose={() => setViewReturn(null)}
          calculateSubtotal={calculateSubtotal}
          calculateGST={calculateGST}
          calculateTotal={calculateTotal}
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
  billSearch,
  setBillSearch,
  showBillSearch,
  setShowBillSearch,
  filteredBillOptions,
  handleBillSelect,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-7xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="text-sm text-[var(--muted)]">
              Select purchase bill and return only purchased items.
            </p>
          </div>

          <button
            type="button"
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
                  Vendor / Bill Search
                </label>

                <input
                  value={billSearch}
                  onChange={(e) => {
                    setBillSearch(e.target.value);
                    setShowBillSearch(true);
                  }}
                  onFocus={() => setShowBillSearch(true)}
                  placeholder="Vendor name or bill number"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                />

                {showBillSearch && (
                  <div className="absolute left-0 right-0 top-[74px] z-[90] max-h-72 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
                    {filteredBillOptions.length > 0 ? (
                      filteredBillOptions.map((bill) => (
                        <button
                          key={bill.id}
                          type="button"
                          onClick={() => handleBillSelect(bill)}
                          className="w-full border-b border-[var(--border)] px-4 py-3 text-left hover:bg-[var(--surface-soft)]"
                        >
                          <p className="font-black">
                            {bill.billNo} - {bill.vendor}
                          </p>

                          <p className="text-sm text-[var(--muted)]">
                            Vendor Bill: {bill.vendorBillNo || "-"}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-sm text-[var(--muted)]">
                        No bill found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Input
                label="Vendor"
                name="vendor"
                value={form.vendor}
                onChange={handleChange}
                required
                readOnly
              />

              <Input
                label="Bill No"
                name="billNo"
                value={form.billNo}
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
                  <option value="Damaged items">Damaged items</option>
                  <option value="Wrong item received">Wrong item received</option>
                  <option value="Quality issue">Quality issue</option>
                  <option value="Excess quantity received">
                    Excess quantity received
                  </option>
                  <option value="Rate difference">Rate difference</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold">
                  Refund / Adjustment
                </label>
                <select
                  name="refundMethod"
                  value={form.refundMethod}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                >
                  <option value="Debit Note">Debit Note</option>
                  <option value="Vendor Adjustment">Vendor Adjustment</option>
                  <option value="Cash Refund">Cash Refund</option>
                  <option value="Bank Refund">Bank Refund</option>
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

              <p className="text-sm font-bold text-[var(--muted)]">
  Items purchase bill se auto aayenge
</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-[var(--surface-soft)]">
                  <tr>
                    <Th>Product</Th>
                    <Th>Purchased Qty</Th>
                    <Th>Return Qty</Th>
                    <Th>Balance Qty</Th>
                    <Th>Rate</Th>
                    <Th>GST %</Th>
                    <Th>Amount</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>

                <tbody>

                {/* {form.items.length === 0 && (
  <tr>
    <td
      colSpan="8"
      className="px-5 py-10 text-center font-bold text-[var(--muted)]"
    >
      Pehle purchase bill select karo. Items purchase bill se auto aayenge.
    </td>
  </tr>
)} */}

                  {form.items.map((item, index) => {
                    const purchasedQty = Number(item.purchasedQty || 0);
                    const returnQty = Number(item.qty || 0);
                    const rate = Number(item.rate || 0);
                    const gst = Number(item.gst || 0);

                    const balanceQty = Math.max(purchasedQty - returnQty, 0);
                    const amount = returnQty * rate;
                    const totalAmount = amount + (amount * gst) / 100;

                    return (
                      <tr
                        key={index}
                        className="border-t border-[var(--border)]"
                      >
                        <Td>
                          <input
  value={item.product}
  readOnly
  required
  placeholder="Product name"
  className="w-full cursor-not-allowed rounded-xl border border-[var(--border)] bg-slate-100 px-4 py-3 outline-none"
/>
                        </Td>

                        <Td>
                          <input
                            type="number"
                            value={purchasedQty}
                            readOnly
                            className="w-28 cursor-not-allowed rounded-xl border border-[var(--border)] bg-slate-100 px-4 py-3 outline-none"
                          />
                        </Td>

                        <Td>
                          <input
                            type="number"
                            min="1"
                            max={purchasedQty || 1}
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

                        <Td bold>₹{totalAmount}</Td>

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
            <SummaryRow label="GST Reversal" value={`₹${gstAmount}`} />

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
              placeholder="Purchase return notes..."
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
              Save Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewModal({ item, onClose, calculateSubtotal, calculateGST, calculateTotal }) {
  const subtotal = calculateSubtotal(item.items);
  const gst = calculateGST(item.items);
  const total = calculateTotal(item.items);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black">Purchase Return Details</h2>
          <button onClick={onClose} className="rounded-xl border border-[var(--border)] p-2">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Info label="Return No" value={item.returnNo} />
          <Info label="Return Date" value={item.returnDate} />
          <Info label="Vendor" value={item.vendor} />
          <Info label="Bill No" value={item.billNo} />
          <Info label="Reason" value={item.reason} />
          <Info label="Refund / Adjustment" value={item.refundMethod} />
          <Info label="Status" value={item.status} />
          <Info label="Subtotal" value={`₹${subtotal}`} />
          <Info label="Return Total" value={`₹${total}`} />
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
  min,
  readOnly = false,
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
        readOnly={readOnly}
        placeholder={label}
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
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[status] || styles.Pending}`}>
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
    <div className={`flex items-center justify-between ${large ? "text-xl font-black" : "font-bold"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-5 py-4 text-left text-sm font-black uppercase">{children}</th>;
}

function Td({ children, bold }) {
  return <td className={`px-5 py-4 ${bold ? "font-bold" : ""}`}>{children}</td>;
}