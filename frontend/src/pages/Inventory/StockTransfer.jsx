import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { transferProductStock } from "../../redux/productSlice";
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

// const warehouses = [
//   "Main Warehouse",
//   "Retail Storage",
//   "Delhi Warehouse",
//   "Mumbai Store",
// ];

// const products = [
//   {
//     name: "Premium Shirt",
//     sku: "SKU-001",
//     availableStock: 120,
//     unit: "Pcs",
//   },
//   {
//     name: "Cotton Hoodie",
//     sku: "SKU-002",
//     availableStock: 45,
//     unit: "Pcs",
//   },
//   {
//     name: "Denim Jacket",
//     sku: "SKU-003",
//     availableStock: 30,
//     unit: "Pcs",
//   },
// ];

const emptyForm = {
  id: null,
  transferNo: "",
  transferDate: new Date().toISOString().split("T")[0],
  fromWarehouse: "",
  toWarehouse: "",
  product: "",
  sku: "",
  quantity: "",
  availableStock: "",
  unit: "Pcs",
  referenceNo: "",
  status: "Pending",
  notes: "",
};

const initialTransfers = [
  {
    id: 1,
    transferNo: "TRF-001",
    transferDate: "2026-05-10",
    fromWarehouse: "Main Warehouse",
    toWarehouse: "Retail Storage",
    product: "Premium Shirt",
    sku: "SKU-001",
    quantity: 20,
    availableStock: 120,
    unit: "Pcs",
    referenceNo: "REQ-001",
    status: "Completed",
    notes: "Transferred shirts to retail storage.",
  },
  {
    id: 2,
    transferNo: "TRF-002",
    transferDate: "2026-05-11",
    fromWarehouse: "Delhi Warehouse",
    toWarehouse: "Mumbai Store",
    product: "Cotton Hoodie",
    sku: "SKU-002",
    quantity: 10,
    availableStock: 45,
    unit: "Pcs",
    referenceNo: "REQ-002",
    status: "Pending",
    notes: "Transfer requested for store stock.",
  },
];

export default function StockTransfer() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products?.products || []);

const warehouses = useMemo(() => {
  const saved = localStorage.getItem("warehouses");
  return saved ? JSON.parse(saved) : [];
}, []);
 const [transfers, setTransfers] = useState(() => {
  const saved = localStorage.getItem("stockTransfers");

  if (saved) {
    return JSON.parse(saved);
  }

  return initialTransfers;
});

useEffect(() => {
  localStorage.setItem("stockTransfers", JSON.stringify(transfers));
}, [transfers]);



  const [form, setForm] = useState({
    ...emptyForm,
    transferNo: `TRF-${String(initialTransfers.length + 1).padStart(3, "0")}`,
  });

  const [showModal, setShowModal] = useState(false);
  const [viewTransfer, setViewTransfer] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const generateTransferNo = () =>
    `TRF-${String(transfers.length + 1).padStart(3, "0")}`;

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

  const filteredTransfers = useMemo(() => {
    return transfers.filter((item) => {
      const text = `${item.transferNo} ${item.product} ${item.sku} ${item.fromWarehouse} ${item.toWarehouse} ${item.referenceNo}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const itemDate = new Date(item.transferDate);
      const matchesFrom = fromDate ? itemDate >= new Date(fromDate) : true;
      const matchesTo = toDate ? itemDate <= new Date(toDate) : true;

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [transfers, search, statusFilter, fromDate, toDate]);

  const totalTransfers = filteredTransfers.length;

  const completedTransfers = filteredTransfers.filter(
    (item) => item.status === "Completed"
  ).length;
  
  const pendingTransfers = filteredTransfers.filter(
    (item) => item.status === "Pending"
  ).length;

  const totalQtyTransferred = filteredTransfers
    .filter((item) => item.status !== "Cancelled")
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      transferNo: generateTransferNo(),
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

  const handleChange = (e) => {
    const { name, value } = e.target;

   if (name === "product") {
  const selectedProduct = products.find((item) => item.name === value);

  setForm({
    ...form,
    product: value,
    productId: selectedProduct?.id || "",
    sku: selectedProduct?.sku || "",
    availableStock: selectedProduct?.currentStock || "",
    unit: selectedProduct?.unit || "Pcs",
  });

  return;
}

    setForm({
      ...form,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (form.fromWarehouse === form.toWarehouse) {
      alert("From Warehouse and To Warehouse cannot be same.");
      return false;
    }

    if (Number(form.quantity || 0) <= 0) {
      alert("Quantity must be greater than zero.");
      return false;
    }

    if (Number(form.quantity || 0) > Number(form.availableStock || 0)) {
      alert("Transfer quantity cannot be greater than available stock.");
      return false;
    }

    return true;
  };
const completeTransferNow = (payload) => {
  const qty = Number(payload.quantity || 0);

  const selectedProduct = products.find(
    (p) =>
      String(p.id) === String(payload.productId) ||
      p.name === payload.product ||
      p.sku === payload.sku
  );

  if (!selectedProduct) {
    alert("Product not found.");
    return false;
  }

  dispatch(
    transferProductStock({
      productId: selectedProduct.id,
      fromWarehouseId: payload.fromWarehouse,
      fromWarehouseName: payload.fromWarehouse,
      toWarehouseId: payload.toWarehouse,
      toWarehouseName: payload.toWarehouse,
      qty,
    })
  );

  const oldStockTransactions =
    JSON.parse(localStorage.getItem("stockTransactions")) || [];

  const alreadyAdded = oldStockTransactions.some(
    (item) => item.referenceNo === payload.transferNo
  );

  if (!alreadyAdded) {
    const transferMovement = {
      id: Date.now(),
      transactionNo: `STK-${String(oldStockTransactions.length + 1).padStart(
        3,
        "0"
      )}`,
      date: payload.transferDate,
      type: "Stock Transfer",
      productId: selectedProduct.id,
      product: payload.product,
      sku: payload.sku,
      warehouse: `${payload.fromWarehouse} → ${payload.toWarehouse}`,
      quantity: qty,
      rate: 0,
      reason: "Stock Transfer",
      referenceNo: payload.transferNo,
      notes: `Transferred ${qty} from ${payload.fromWarehouse} to ${payload.toWarehouse}`,
      closingStock: Number(selectedProduct.currentStock || 0),
    };

    localStorage.setItem(
      "stockTransactions",
      JSON.stringify([transferMovement, ...oldStockTransactions])
    );
  }

  return true;
};

const handleSubmit = (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const payload = {
    ...form,
    id: editMode ? form.id : Date.now(),
    quantity: Number(form.quantity || 0),
    availableStock: Number(form.availableStock || 0),
  };

  if (payload.status === "Completed") {
    const completed = completeTransferNow(payload);
    if (!completed) return;
  }

  if (editMode) {
    setTransfers((prev) =>
      prev.map((item) => (item.id === payload.id ? payload : item))
    );
  } else {
    setTransfers((prev) => [payload, ...prev]);
  }

  resetForm();
};

  const handleEdit = (item) => {
    setForm(item);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Are you sure you want to delete this stock transfer?");
    if (!ok) return;

    setTransfers((prev) => prev.filter((item) => item.id !== id));
  };

const handleComplete = (id) => {
  const transfer = transfers.find((item) => item.id === id);
  if (!transfer) return;

  const qty = Number(transfer.quantity || 0);

  const selectedProduct = products.find(
    (p) =>
      String(p.id) === String(transfer.productId) ||
      p.name === transfer.product ||
      p.sku === transfer.sku
  );

  if (!selectedProduct) {
    alert("Product not found.");
    return;
  }

  dispatch(
    transferProductStock({
      productId: selectedProduct.id,
      fromWarehouseId: transfer.fromWarehouse,
      fromWarehouseName: transfer.fromWarehouse,
      toWarehouseId: transfer.toWarehouse,
      toWarehouseName: transfer.toWarehouse,
      qty,
    })
  );

  const oldStockTransactions =
    JSON.parse(localStorage.getItem("stockTransactions")) || [];

  const alreadyAdded = oldStockTransactions.some(
    (item) => item.referenceNo === transfer.transferNo
  );

  if (!alreadyAdded) {
    const transferMovement = {
      id: Date.now(),
      transactionNo: `STK-${String(oldStockTransactions.length + 1).padStart(
        3,
        "0"
      )}`,
      date: transfer.transferDate,
      type: "Stock Transfer",
      productId: selectedProduct.id,
      product: transfer.product,
      sku: transfer.sku,
      warehouse: `${transfer.fromWarehouse} → ${transfer.toWarehouse}`,
      quantity: qty,
      rate: 0,
      reason: "Stock Transfer",
      referenceNo: transfer.transferNo,
      notes: `Transferred ${qty} from ${transfer.fromWarehouse} to ${transfer.toWarehouse}`,
      closingStock: Number(selectedProduct.currentStock || 0),
    };

    localStorage.setItem(
      "stockTransactions",
      JSON.stringify([transferMovement, ...oldStockTransactions])
    );
  }

  setTransfers((prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, status: "Completed" } : item
    )
  );
};

  const exportCSV = () => {
    const headers = [
      "Transfer No",
      "Date",
      "From Warehouse",
      "To Warehouse",
      "Product",
      "SKU",
      "Quantity",
      "Unit",
      "Reference No",
      "Status",
      "Notes",
    ];

    const rows = filteredTransfers.map((item) => [
      item.transferNo,
      item.transferDate,
      item.fromWarehouse,
      item.toWarehouse,
      item.product,
      item.sku,
      item.quantity,
      item.unit,
      item.referenceNo,
      item.status,
      item.notes,
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
    link.download = "stock-transfers.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Stock Transfer</h1>

          <p className="mt-2 text-slate-300">
            Transfer stock between warehouses and track internal stock movement.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              ...emptyForm,
              transferNo: generateTransferNo(),
            });

            setEditMode(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
        >
          <Plus size={18} />
          Create Transfer
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard title="Total Transfers" value={totalTransfers} />
        <StatCard title="Completed" value={completedTransfers} />
        <StatCard title="Pending" value={pendingTransfers} />
        <StatCard title="Qty Transferred" value={totalQtyTransferred} />
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
              placeholder="Search transfer, product, warehouse..."
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
            <label className="mb-1 block text-sm font-bold">Status</label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportCSV}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-3 font-bold text-white"
            >
              <Download size={17} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
<div className="grid gap-4 md:hidden">
  {filteredTransfers.map((item) => (
    <div
      key={item.id}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-[var(--text)]">{item.transferNo}</p>
          <p className="mt-1 text-sm font-medium text-[var(--muted)]">
            {item.product}
          </p>
        </div>

        <StatusBadge status={item.status} />
      </div>

      <div className="mb-4 rounded-2xl bg-[var(--surface-soft)] p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--muted)]">
              From
            </p>
            <p className="mt-1 text-sm font-black text-[var(--text)]">
              {item.fromWarehouse}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold uppercase text-[var(--muted)]">
              To
            </p>
            <p className="mt-1 text-sm font-black text-[var(--text)]">
              {item.toWarehouse}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <MobileInfo label="Date" value={item.transferDate} />
        <MobileInfo label="SKU" value={item.sku} />
        <MobileInfo label="Qty" value={`${item.quantity} ${item.unit}`} strong />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <IconButton color="blue" onClick={() => setViewTransfer(item)}>
          <Eye size={16} />
        </IconButton>

        <IconButton color="yellow" onClick={() => handleEdit(item)}>
          <Pencil size={16} />
        </IconButton>

        {item.status === "Pending" && (
          <IconButton color="green" onClick={() => handleComplete(item.id)}>
            <CheckCircle size={16} />
          </IconButton>
        )}

        <IconButton color="red" onClick={() => handleDelete(item.id)}>
          <Trash2 size={16} />
        </IconButton>
      </div>
    </div>
  ))}

  {filteredTransfers.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
      No stock transfers found
    </div>
  )}
</div>

{/* Desktop Table */}
<div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[1250px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Transfer No</Th>
        <Th>Date</Th>
        <Th>From</Th>
        <Th>To</Th>
        <Th>Product</Th>
        <Th>SKU</Th>
        <Th>Qty</Th>
        <Th>Status</Th>
        <Th>Actions</Th>
      </tr>
    </thead>

    <tbody>
      {filteredTransfers.map((item) => (
        <tr
          key={item.id}
          className="border-b border-[var(--border)] last:border-b-0"
        >
          <Td bold>{item.transferNo}</Td>
          <Td>{item.transferDate}</Td>
          <Td>{item.fromWarehouse}</Td>
          <Td>{item.toWarehouse}</Td>
          <Td>{item.product}</Td>
          <Td>{item.sku}</Td>
          <Td bold>
            {item.quantity} {item.unit}
          </Td>
          <Td>
            <StatusBadge status={item.status} />
          </Td>
          <Td>
            <div className="flex items-center gap-2">
              <IconButton color="blue" onClick={() => setViewTransfer(item)}>
                <Eye size={16} />
              </IconButton>

              <IconButton color="yellow" onClick={() => handleEdit(item)}>
                <Pencil size={16} />
              </IconButton>

              {item.status === "Pending" && (
                <IconButton color="green" onClick={() => handleComplete(item.id)}>
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

      {filteredTransfers.length === 0 && (
        <tr>
          <td
            colSpan="9"
            className="px-5 py-10 text-center text-[var(--muted)]"
          >
            No stock transfers found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

   

      {showModal && (
        <TransferModal
  title={editMode ? "Edit Stock Transfer" : "Create Stock Transfer"}
  form={form}
  warehouses={warehouses}
  products={products}
  handleChange={handleChange}
  handleSubmit={handleSubmit}
  resetForm={resetForm}
  editMode={editMode}
/>
      )}

      {viewTransfer && (
        <ViewTransferModal
          transfer={viewTransfer}
          onClose={() => setViewTransfer(null)}
        />
      )}
    </div>
  );
}

function TransferModal({
  title,
  form,
  warehouses,
  products,
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
              Move product stock from one warehouse to another warehouse.
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
              label="Transfer No"
              name="transferNo"
              value={form.transferNo}
              onChange={handleChange}
              required
            />

            <Input
              label="Transfer Date"
              name="transferDate"
              type="date"
              value={form.transferDate}
              onChange={handleChange}
              required
            />

            <div>
              <label className="mb-1 block text-sm font-bold">
                From Warehouse
              </label>

              <select
                name="fromWarehouse"
                value={form.fromWarehouse}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option value="">Select Warehouse</option>
               {warehouses.map((warehouse) => (
  <option key={warehouse.id} value={warehouse.name}>
    {warehouse.name}
  </option>
))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold">
                To Warehouse
              </label>

              <select
                name="toWarehouse"
                value={form.toWarehouse}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option value="">Select Warehouse</option>
              {warehouses.map((warehouse) => (
  <option key={warehouse.id} value={warehouse.name}>
    {warehouse.name}
  </option>
))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold">Product</label>

              <select
                name="product"
                value={form.product}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option value="">Select Product</option>
                {products.map((product) => (
  <option key={product.id} value={product.name}>
    {product.name} | SKU: {product.sku || "-"} | Stock:{" "}
    {product.currentStock || 0}
  </option>
))}
              </select>
            </div>

            <Input
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              required
            />

            <Input
              label="Available Stock"
              name="availableStock"
              type="number"
              value={form.availableStock}
              onChange={handleChange}
              required
            />

            <Input
              label="Quantity"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              required
            />

            <Input
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
            />

            <Input
              label="Reference No"
              name="referenceNo"
              value={form.referenceNo}
              onChange={handleChange}
              placeholder="REQ / DOC / NOTE"
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
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
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
              placeholder="Transfer notes..."
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
              {editMode ? "Update Transfer" : "Save Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewTransferModal({ transfer, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Stock Transfer Details</h2>

            <p className="text-sm text-[var(--muted)]">
              Complete warehouse transfer information.
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
          <Info label="Transfer No" value={transfer.transferNo} />
          <Info label="Transfer Date" value={transfer.transferDate} />
          <Info label="From Warehouse" value={transfer.fromWarehouse} />
          <Info label="To Warehouse" value={transfer.toWarehouse} />
          <Info label="Product" value={transfer.product} />
          <Info label="SKU" value={transfer.sku} />
          <Info
            label="Quantity"
            value={`${transfer.quantity} ${transfer.unit}`}
          />
          <Info label="Available Stock" value={transfer.availableStock} />
          <Info label="Reference No" value={transfer.referenceNo} />
          <Info label="Status" value={transfer.status} />
        </div>

        {transfer.notes && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <h3 className="font-black">Notes</h3>

            <p className="mt-2 text-sm text-[var(--muted)]">
              {transfer.notes}
            </p>
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
    Completed: "bg-green-100 text-green-700",
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
    green: "bg-green-100 text-green-700",
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
  return (
    <td className={`px-5 py-4 ${bold ? "font-bold" : ""}`}>
      {children}
    </td>
  );
}
function MobileInfo({ label, value, strong }) { return ( <div className="rounded-xl bg-[var(--surface-soft)] p-3"> <p className="text-xs font-bold uppercase text-[var(--muted)]"> {label} </p> <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}> {value || "-"} </p> </div> ); }