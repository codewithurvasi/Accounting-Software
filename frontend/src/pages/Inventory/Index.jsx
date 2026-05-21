import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProduct, updateProduct, deleteProduct } from "../../redux/productSlice";
import {
  Plus,
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

const emptyForm = {
  id: null,
  name: "",
  sku: "",
  category: "",
  unit: "Pcs",
  hsn: "",
  warehouse: "",
  openingStock: "",
  currentStock: "",
  reorderLevel: "",
  purchasePrice: "",
  salePrice: "",
  gst: "18",
  status: "Active",
  description: "",
};

export default function Inventory() {
const dispatch = useDispatch();

const products = useSelector(
  (state) => state.products?.products || []
);

  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.name} ${product.sku} ${product.category} ${product.hsn} ${product.warehouse}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;

      const isLowStock =
        Number(product.currentStock || 0) <= Number(product.reorderLevel || 0);

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "Low Stock" && isLowStock) ||
        (stockFilter === "In Stock" && !isLowStock);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];

  const totalProducts = filteredProducts.length;

  const lowStockCount = filteredProducts.filter(
    (p) => Number(p.currentStock || 0) <= Number(p.reorderLevel || 0)
  ).length;

  const inventoryValue = filteredProducts.reduce(
    (sum, p) => sum + Number(p.currentStock || 0) * Number(p.purchasePrice || 0),
    0
  );

  const totalSaleValue = filteredProducts.reduce(
    (sum, p) => sum + Number(p.currentStock || 0) * Number(p.salePrice || 0),
    0
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditMode(false);
    setShowModal(false);
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setStockFilter("All");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
      ...(name === "openingStock" && !editMode ? { currentStock: value } : {}),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      id: editMode ? form.id : Date.now(),
      openingStock: Number(form.openingStock || 0),
      currentStock: Number(form.currentStock || form.openingStock || 0),
      reorderLevel: Number(form.reorderLevel || 0),
      purchasePrice: Number(form.purchasePrice || 0),
      salePrice: Number(form.salePrice || 0),
      gst: Number(form.gst || 0),
    };

  if (editMode) {
  dispatch(updateProduct(payload));
} else {
  dispatch(addProduct(payload));
}

    resetForm();
  };

  const handleEdit = (product) => {
    setForm(product);
    setEditMode(true);
    setShowModal(true);
  };

 const handleDelete = (id) => {
  const ok = window.confirm("Are you sure you want to delete this product?");
  if (!ok) return;

  dispatch(deleteProduct(id));
};

  const exportCSV = () => {
    const headers = [
      "Product",
      "SKU",
      "Category",
      "Unit",
      "HSN",
      "Warehouse",
      "Current Stock",
      "Reorder Level",
      "Purchase Price",
      "Sale Price",
      "GST",
      "Status",
    ];

    const rows = filteredProducts.map((p) => [
      p.name,
      p.sku,
      p.category,
      p.unit,
      p.hsn,
      p.warehouse,
      p.currentStock,
      p.reorderLevel,
      p.purchasePrice,
      p.salePrice,
      p.gst,
      p.status,
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
    link.download = "inventory-products.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Products</h1>
          <p className="mt-2 text-slate-300">
            Manage inventory products, SKU, HSN, stock, pricing and warehouse.
          </p>
        </div>

        <button
          onClick={() => {
            setForm(emptyForm);
            setEditMode(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard title="Total Products" value={totalProducts} />
        <StatCard title="Low Stock" value={lowStockCount} />
        <StatCard title="Inventory Value" value={`₹${inventoryValue}`} />
        <StatCard title="Sale Value" value={`₹${totalSaleValue}`} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black">Filters</h2>

          <button
            onClick={resetFilters}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
            <Search size={18} className="text-[var(--muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, SKU, HSN..."
              className="w-full bg-transparent py-3 outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
          >
            <option value="All">All Stock</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
          </select>

          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-3 font-bold text-white"
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </div>

     {/* Mobile Cards */}
<div className="grid gap-4 md:hidden">
  {filteredProducts.map((product) => {
    const isLowStock =
      Number(product.currentStock || 0) <= Number(product.reorderLevel || 0);

    return (
      <div
        key={product.id}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-[var(--text)]">{product.name}</p>
            <p className="text-sm text-[var(--muted)]">{product.sku}</p>
          </div>

          <StatusBadge status={isLowStock ? "Low Stock" : product.status} />
        </div>

        <div className="grid gap-2 text-sm">
          <MobileInfo label="Category" value={product.category || "-"} />
          <MobileInfo label="HSN" value={product.hsn || "-"} />
          <MobileInfo
            label="Stock"
            value={`${product.currentStock} ${product.unit}`}
          />
          <MobileInfo label="Reorder" value={product.reorderLevel} />
          <MobileInfo label="Purchase" value={`₹${product.purchasePrice}`} />
          <MobileInfo label="Sale Price" value={`₹${product.salePrice}`} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <IconButton color="blue" onClick={() => setViewProduct(product)}>
            <Eye size={16} />
          </IconButton>

          <IconButton color="yellow" onClick={() => handleEdit(product)}>
            <Pencil size={16} />
          </IconButton>

          <IconButton color="red" onClick={() => handleDelete(product.id)}>
            <Trash2 size={16} />
          </IconButton>
        </div>
      </div>
    );
  })}

  {filteredProducts.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
      No products found
    </div>
  )}
</div>

{/* Desktop Table */}
<div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[1200px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Product</Th>
        <Th>SKU</Th>
        <Th>Category</Th>
        <Th>HSN</Th>
        <Th>Stock</Th>
        <Th>Reorder</Th>
        <Th>Purchase</Th>
        <Th>Sale Price</Th>
        <Th>Status</Th>
        <Th>Actions</Th>
      </tr>
    </thead>

    <tbody>
      {filteredProducts.map((product) => {
        const isLowStock =
          Number(product.currentStock || 0) <=
          Number(product.reorderLevel || 0);

        return (
          <tr
            key={product.id}
            className="border-b border-[var(--border)] last:border-b-0"
          >
            <Td bold>{product.name}</Td>
            <Td>{product.sku}</Td>
            <Td>{product.category || "-"}</Td>
            <Td>{product.hsn || "-"}</Td>
            <Td>
              <span
                className={`font-bold ${
                  isLowStock ? "text-red-600" : "text-green-700"
                }`}
              >
                {product.currentStock} {product.unit}
              </span>
            </Td>
            <Td>{product.reorderLevel}</Td>
            <Td>₹{product.purchasePrice}</Td>
            <Td bold>₹{product.salePrice}</Td>
            <Td>
              <StatusBadge status={isLowStock ? "Low Stock" : product.status} />
            </Td>
            <Td>
              <div className="flex items-center gap-2">
                <IconButton color="blue" onClick={() => setViewProduct(product)}>
                  <Eye size={16} />
                </IconButton>

                <IconButton color="yellow" onClick={() => handleEdit(product)}>
                  <Pencil size={16} />
                </IconButton>

                <IconButton color="red" onClick={() => handleDelete(product.id)}>
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </Td>
          </tr>
        );
      })}

      {filteredProducts.length === 0 && (
        <tr>
          <td
            colSpan="10"
            className="px-5 py-10 text-center text-[var(--muted)]"
          >
            No products found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      

      {showModal && (
        <ProductModal
          title={editMode ? "Edit Product" : "Add New Product"}
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          editMode={editMode}
        />
      )}

      {viewProduct && (
        <ViewProductModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
        />
      )}
    </div>
  );
}

function ProductModal({
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
              Enter complete product, stock, tax and pricing details.
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
          <Section title="Product Details">
            <Input
              label="Product Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Input
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              required
            />

            <Input
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Apparel / Electronics"
            />

            <Select
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              options={["Pcs", "Kg", "Meter", "Box", "Dozen", "Litre"]}
            />

            <Input
              label="HSN Code"
              name="hsn"
              value={form.hsn}
              onChange={handleChange}
              placeholder="HSN / SAC"
            />

            <Input
              label="Warehouse"
              name="warehouse"
              value={form.warehouse}
              onChange={handleChange}
              placeholder="Main Warehouse"
            />
          </Section>

          <Section title="Stock Details">
            <Input
              label="Opening Stock"
              name="openingStock"
              type="number"
              value={form.openingStock}
              onChange={handleChange}
            />

            <Input
              label="Current Stock"
              name="currentStock"
              type="number"
              value={form.currentStock}
              onChange={handleChange}
            />

            <Input
              label="Reorder Level"
              name="reorderLevel"
              type="number"
              value={form.reorderLevel}
              onChange={handleChange}
            />
          </Section>

          <Section title="Pricing & Tax">
            <Input
              label="Purchase Price"
              name="purchasePrice"
              type="number"
              value={form.purchasePrice}
              onChange={handleChange}
            />

            <Input
              label="Sale Price"
              name="salePrice"
              type="number"
              value={form.salePrice}
              onChange={handleChange}
            />

            <Select
              label="GST %"
              name="gst"
              value={form.gst}
              onChange={handleChange}
              options={["0", "5", "12", "18", "28"]}
            />

            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={["Active", "Inactive"]}
            />
          </Section>

          <div>
            <label className="mb-2 block text-sm font-bold">Description</label>
            <textarea
              rows="4"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Product description..."
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
              {editMode ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewProductModal({ product, onClose }) {
  const stockValue =
    Number(product.currentStock || 0) * Number(product.purchasePrice || 0);

  const saleValue =
    Number(product.currentStock || 0) * Number(product.salePrice || 0);

  const isLowStock =
    Number(product.currentStock || 0) <= Number(product.reorderLevel || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Product Details</h2>
            <p className="text-sm text-[var(--muted)]">
              Complete stock, pricing and tax information.
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
          <Info label="Product Name" value={product.name} />
          <Info label="SKU" value={product.sku} />
          <Info label="Category" value={product.category} />
          <Info label="Unit" value={product.unit} />
          <Info label="HSN Code" value={product.hsn} />
          <Info label="Warehouse" value={product.warehouse} />
          <Info label="Opening Stock" value={`${product.openingStock} ${product.unit}`} />
          <Info label="Current Stock" value={`${product.currentStock} ${product.unit}`} />
          <Info label="Reorder Level" value={product.reorderLevel} />
          <Info label="Purchase Price" value={`₹${product.purchasePrice}`} />
          <Info label="Sale Price" value={`₹${product.salePrice}`} />
          <Info label="GST" value={`${product.gst}%`} />
          <Info label="Stock Value" value={`₹${stockValue}`} />
          <Info label="Sale Value" value={`₹${saleValue}`} />
          <Info label="Status" value={isLowStock ? "Low Stock" : product.status} />
        </div>

        {product.description && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <h3 className="font-black">Description</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-black">{title}</h3>
      <div className="grid gap-4 md:grid-cols-4">{children}</div>
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
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        placeholder={placeholder || label}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-red-100 text-red-700",
    "Low Stock": "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || styles.Active
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