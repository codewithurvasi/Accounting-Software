import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../redux/productSlice";
import {
  Plus,
  Search,
  Download,
  Eye,
  Trash2,
  X,
  RotateCcw,
} from "lucide-react";

const emptyForm = {
  id: null,
  transactionNo: "",
  date: new Date().toISOString().split("T")[0],
  type: "Stock In",
  productId: "",
  product: "",
  sku: "",
  warehouse: "Main Warehouse",
  quantity: "",
  rate: "",
  reason: "Purchase",
  referenceNo: "",
  notes: "",
};

export default function StockManagement() {
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products?.products || []);

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("stockTransactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState(emptyForm);
  const [showModal, setShowModal] = useState(false);
  const [viewTransaction, setViewTransaction] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    localStorage.setItem("stockTransactions", JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
  const handleStockTransactionsUpdated = (event) => {
    if (event.detail) {
      setTransactions(event.detail);
    } else {
      const saved = JSON.parse(localStorage.getItem("stockTransactions")) || [];
      setTransactions(saved);
    }
  };

  window.addEventListener(
    "stockTransactionsUpdated",
    handleStockTransactionsUpdated
  );

  return () => {
    window.removeEventListener(
      "stockTransactionsUpdated",
      handleStockTransactionsUpdated
    );
  };
}, []);

  const generateTransactionNo = () =>
    `STK-${String(transactions.length + 1).padStart(3, "0")}`;

  const currentInventoryValue = products.reduce(
    (sum, p) =>
      sum + Number(p.currentStock || 0) * Number(p.purchasePrice || 0),
    0
  );

  const totalProducts = products.length;

  const totalCurrentStock = products.reduce(
    (sum, p) => sum + Number(p.currentStock || 0),
    0
  );

  const lowStockCount = products.filter(
    (p) => Number(p.currentStock || 0) <= Number(p.reorderLevel || 0)
  ).length;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const text =
        `${item.transactionNo} ${item.product} ${item.sku} ${item.warehouse} ${item.reason} ${item.referenceNo}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || item.type === typeFilter;

      const itemDate = new Date(item.date);
      const matchesFrom = fromDate ? itemDate >= new Date(fromDate) : true;
      const matchesTo = toDate ? itemDate <= new Date(toDate) : true;

      return matchesSearch && matchesType && matchesFrom && matchesTo;
    });
  }, [transactions, search, typeFilter, fromDate, toDate]);

  const resetForm = () => {
    setForm(emptyForm);
    setShowModal(false);
  };

  const openAddModal = () => {
    setForm({
      ...emptyForm,
      transactionNo: generateTransactionNo(),
      date: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setFromDate("");
    setToDate("");
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductSelect = (productId) => {
    const selectedProduct = products.find(
      (p) => Number(p.id) === Number(productId)
    );

    if (!selectedProduct) return;

    setForm({
      ...form,
      productId: selectedProduct.id,
      product: selectedProduct.name || "",
      sku: selectedProduct.sku || "",
      warehouse: selectedProduct.warehouse || "Main Warehouse",
      rate: selectedProduct.purchasePrice || selectedProduct.salePrice || "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const matchedProduct = products.find(
      (p) => Number(p.id) === Number(form.productId)
    );

    if (!matchedProduct) {
      alert("Please select product.");
      return;
    }

    const qty = Number(form.quantity || 0);

    if (qty <= 0) {
      alert("Quantity 0 se zyada honi chahiye.");
      return;
    }

    let updatedStock = Number(matchedProduct.currentStock || 0);

    if (form.type === "Stock In") {
      updatedStock += qty;
    }

    if (form.type === "Stock Out") {
      if (qty > updatedStock) {
        alert(`Available stock sirf ${updatedStock} hai.`);
        return;
      }

      updatedStock -= qty;
    }

    if (form.type === "Adjustment") {
      updatedStock = qty;
    }

    dispatch(
      updateProduct({
        ...matchedProduct,
        currentStock: updatedStock,
      })
    );

    const payload = {
      ...form,
      id: Date.now(),
      quantity: qty,
      rate: Number(form.rate || 0),
      closingStock: updatedStock,
    };

    setTransactions((prev) => [payload, ...prev]);
    resetForm();
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Are you sure you want to delete this stock entry?");
    if (!ok) return;

    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  const exportCSV = () => {
    const headers = [
      "Transaction No",
      "Date",
      "Type",
      "Product",
      "SKU",
      "Warehouse",
      "Quantity",
      "Rate",
      "Value",
      "Reason",
      "Reference No",
      "Closing Stock",
    ];

    const rows = filteredTransactions.map((item) => [
      item.transactionNo,
      item.date,
      item.type,
      item.product,
      item.sku,
      item.warehouse,
      item.quantity,
      item.rate,
      Number(item.quantity || 0) * Number(item.rate || 0),
      item.reason,
      item.referenceNo,
      item.closingStock,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "stock-management.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Stock Management</h1>
          <p className="mt-2 text-slate-300">
            Products ka current stock aur stock movement history.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
        >
          <Plus size={18} />
          Add Stock Entry
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard title="Total Products" value={totalProducts} />
        <StatCard title="Current Stock" value={totalCurrentStock} />
        <StatCard title="Low Stock" value={lowStockCount} />
        <StatCard title="Inventory Value" value={`₹${currentInventoryValue}`} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="border-b border-[var(--border)] p-5">
          <h2 className="text-xl font-black">Current Stock</h2>
          <p className="text-sm text-[var(--muted)]">
            Products page me added items yaha live stock ke sath show honge.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
              <tr>
                <Th>Product</Th>
                <Th>SKU</Th>
                <Th>Category</Th>
                <Th>Warehouse</Th>
                <Th>Current Stock</Th>
                <Th>Reorder</Th>
                <Th>Purchase</Th>
                <Th>Sale Price</Th>
                <Th>Stock Value</Th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const isLowStock =
                  Number(product.currentStock || 0) <=
                  Number(product.reorderLevel || 0);

                return (
                  <tr
                    key={product.id}
                    className="border-b border-[var(--border)] last:border-b-0"
                  >
                    <Td bold>{product.name}</Td>
                    <Td>{product.sku || "-"}</Td>
                    <Td>{product.category || "-"}</Td>
                   <Td>
  {product.warehouseStocks?.length
    ? product.warehouseStocks
        .filter((w) => Number(w.stock || 0) > 0)
        .map((w) => `${w.warehouse}: ${w.stock}`)
        .join(", ")
    : product.warehouse || "Main Warehouse"}
</Td>
                    <Td bold>
                      <span
                        className={
                          isLowStock ? "text-red-600" : "text-green-700"
                        }
                      >
                        {product.currentStock || 0} {product.unit || "Pcs"}
                      </span>
                    </Td>
                    <Td>{product.reorderLevel || 0}</Td>
                    <Td>₹{product.purchasePrice || 0}</Td>
                    <Td>₹{product.salePrice || 0}</Td>
                    <Td bold>
                      ₹
                      {Number(product.currentStock || 0) *
                        Number(product.purchasePrice || 0)}
                    </Td>
                  </tr>
                );
              })}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="px-5 py-10 text-center text-[var(--muted)]"
                  >
                    No products found. Pehle Products page me product add karo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black">Stock Movement Filters</h2>

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
              placeholder="Search product, SKU, reference..."
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
            <label className="mb-1 block text-sm font-bold">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              <option value="All">All Types</option>
              <option value="Stock In">Stock In</option>
              <option value="Stock Out">Stock Out</option>
              <option value="Adjustment">Adjustment</option>
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

      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
        <table className="w-full min-w-[1150px] text-left">
          <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
            <tr>
              <Th>Txn No</Th>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Product</Th>
              <Th>SKU</Th>
              <Th>Warehouse</Th>
              <Th>Qty</Th>
              <Th>Value</Th>
              <Th>Closing Stock</Th>
              <Th>Reason</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map((item) => (
              <tr
                key={item.id}
                className="border-b border-[var(--border)] last:border-b-0"
              >
                <Td bold>{item.transactionNo}</Td>
                <Td>{item.date}</Td>
                <Td>
                  <TypeBadge type={item.type} />
                </Td>
                <Td>{item.product}</Td>
                <Td>{item.sku}</Td>
                <Td>{item.warehouse}</Td>
                <Td bold>{item.quantity}</Td>
                <Td>₹{Number(item.quantity || 0) * Number(item.rate || 0)}</Td>
                <Td bold>{item.closingStock ?? "-"}</Td>
                <Td>{item.reason}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <IconButton color="blue" onClick={() => setViewTransaction(item)}>
                      <Eye size={16} />
                    </IconButton>

                    <IconButton color="red" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </Td>
              </tr>
            ))}

            {filteredTransactions.length === 0 && (
              <tr>
                <td
                  colSpan="11"
                  className="px-5 py-10 text-center text-[var(--muted)]"
                >
                  No stock transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <StockModal
          form={form}
          products={products}
          handleChange={handleChange}
          handleProductSelect={handleProductSelect}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
        />
      )}

      {viewTransaction && (
        <ViewModal
          item={viewTransaction}
          onClose={() => setViewTransaction(null)}
        />
      )}
    </div>
  );
}

function StockModal({
  form,
  products,
  handleChange,
  handleProductSelect,
  handleSubmit,
  resetForm,
}) {
  const value = Number(form.quantity || 0) * Number(form.rate || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Add Stock Entry</h2>
            <p className="text-sm text-[var(--muted)]">
              Stock In / Stock Out / Adjustment entry.
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              label="Transaction No"
              name="transactionNo"
              value={form.transactionNo}
              onChange={handleChange}
              required
            />

            <Input
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />

            <div>
              <label className="mb-1 block text-sm font-bold">Movement Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option value="Stock In">Stock In</option>
                <option value="Stock Out">Stock Out</option>
                <option value="Adjustment">Adjustment</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold">Product</label>
              <select
                name="productId"
                value={form.productId || ""}
                onChange={(e) => handleProductSelect(e.target.value)}
                required
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option value="">Select Product</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
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
              readOnly
              required
            />

            <Input
              label="Warehouse"
              name="warehouse"
              value={form.warehouse}
              onChange={handleChange}
              required
            />

            <Input
              label={
                form.type === "Adjustment"
                  ? "New Stock Quantity"
                  : "Quantity"
              }
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
            />

            <Input
              label="Rate"
              name="rate"
              type="number"
              min="0"
              value={form.rate}
              onChange={handleChange}
            />

            <div>
              <label className="mb-1 block text-sm font-bold">Reason</label>
              <select
                name="reason"
                value={form.reason}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option value="Purchase">Purchase</option>
                <option value="Sale">Sale</option>
                <option value="Sales Return">Sales Return</option>
                <option value="Purchase Return">Purchase Return</option>
                <option value="Stock Adjustment">Stock Adjustment</option>
                <option value="Damage / Wastage">Damage / Wastage</option>
              </select>
            </div>

            <Input
              label="Reference No"
              name="referenceNo"
              value={form.referenceNo}
              onChange={handleChange}
              placeholder="BILL / INV / SR / PR"
            />
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <div className="flex items-center justify-between font-black">
              <span>Transaction Value</span>
              <span>₹{value}</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Notes</label>
            <textarea
              rows="4"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Stock movement notes..."
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
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewModal({ item, onClose }) {
  const value = Number(item.quantity || 0) * Number(item.rate || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black">Stock Entry Details</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Info label="Transaction No" value={item.transactionNo} />
          <Info label="Date" value={item.date} />
          <Info label="Type" value={item.type} />
          <Info label="Product" value={item.product} />
          <Info label="SKU" value={item.sku} />
          <Info label="Warehouse" value={item.warehouse} />
          <Info label="Quantity" value={item.quantity} />
          <Info label="Rate" value={`₹${item.rate}`} />
          <Info label="Value" value={`₹${value}`} />
          <Info label="Closing Stock" value={item.closingStock} />
          <Info label="Reason" value={item.reason} />
          <Info label="Reference No" value={item.referenceNo} />
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
        placeholder={placeholder || label}
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

function TypeBadge({ type }) {
 const styles = {
  "Stock In": "bg-green-100 text-green-700",
  "Stock Out": "bg-red-100 text-red-700",
  Adjustment: "bg-yellow-100 text-yellow-700",
  "Stock Transfer": "bg-blue-100 text-blue-700",

  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[type] || "bg-slate-100 text-slate-700"
      }`}
    >
      {type}
    </span>
  );
}

function IconButton({ children, onClick, color }) {
  const styles = {
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <button type="button" onClick={onClick} className={`rounded-lg p-2 ${styles[color]}`}>
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