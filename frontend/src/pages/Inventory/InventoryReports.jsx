import { useMemo, useState } from "react";
import {
  Download,
  Printer,
  RotateCcw,
  Search,
} from "lucide-react";

const inventoryData = [
  {
    id: 1,
    product: "Premium Shirt",
    sku: "SKU-001",
    category: "Apparel",
    warehouse: "Main Warehouse",
    openingStock: 100,
    stockIn: 50,
    stockOut: 30,
    currentStock: 120,
    reorderLevel: 20,
    purchasePrice: 550,
    salePrice: 899,
    movement: "Fast Moving",
  },
  {
    id: 2,
    product: "Cotton Hoodie",
    sku: "SKU-002",
    category: "Apparel",
    warehouse: "Retail Storage",
    openingStock: 50,
    stockIn: 15,
    stockOut: 20,
    currentStock: 45,
    reorderLevel: 15,
    purchasePrice: 950,
    salePrice: 1499,
    movement: "Medium Moving",
  },
  {
    id: 3,
    product: "Denim Jacket",
    sku: "SKU-003",
    category: "Apparel",
    warehouse: "Mumbai Store",
    openingStock: 40,
    stockIn: 5,
    stockOut: 20,
    currentStock: 25,
    reorderLevel: 30,
    purchasePrice: 1200,
    salePrice: 1999,
    movement: "Fast Moving",
  },
  {
    id: 4,
    product: "Formal Trouser",
    sku: "SKU-004",
    category: "Apparel",
    warehouse: "Delhi Warehouse",
    openingStock: 25,
    stockIn: 2,
    stockOut: 3,
    currentStock: 24,
    reorderLevel: 10,
    purchasePrice: 700,
    salePrice: 1199,
    movement: "Slow Moving",
  },
];

export default function InventoryReports() {
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("All");
  const [movementFilter, setMovementFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const warehouses = [
    "All",
    ...new Set(inventoryData.map((item) => item.warehouse)),
  ];

  const filteredData = useMemo(() => {
    return inventoryData.filter((item) => {
      const text = `${item.product} ${item.sku} ${item.category} ${item.warehouse}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesWarehouse =
        warehouseFilter === "All" || item.warehouse === warehouseFilter;

      const matchesMovement =
        movementFilter === "All" || item.movement === movementFilter;

      const isLowStock =
        Number(item.currentStock || 0) <= Number(item.reorderLevel || 0);

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "Low Stock" && isLowStock) ||
        (stockFilter === "In Stock" && !isLowStock);

      return (
        matchesSearch &&
        matchesWarehouse &&
        matchesMovement &&
        matchesStock
      );
    });
  }, [search, warehouseFilter, movementFilter, stockFilter]);

  const totalStockValue = filteredData.reduce(
    (sum, item) =>
      sum + Number(item.currentStock || 0) * Number(item.purchasePrice || 0),
    0
  );

  const totalSaleValue = filteredData.reduce(
    (sum, item) =>
      sum + Number(item.currentStock || 0) * Number(item.salePrice || 0),
    0
  );

  const fastMovingItems = filteredData.filter(
    (item) => item.movement === "Fast Moving"
  ).length;

  const lowStockItems = filteredData.filter(
    (item) => Number(item.currentStock || 0) <= Number(item.reorderLevel || 0)
  ).length;

  const totalStockQty = filteredData.reduce(
    (sum, item) => sum + Number(item.currentStock || 0),
    0
  );

  const resetFilters = () => {
    setSearch("");
    setWarehouseFilter("All");
    setMovementFilter("All");
    setStockFilter("All");
  };

  const exportCSV = () => {
    const headers = [
      "Product",
      "SKU",
      "Category",
      "Warehouse",
      "Opening Stock",
      "Stock In",
      "Stock Out",
      "Current Stock",
      "Reorder Level",
      "Purchase Price",
      "Stock Value",
      "Sale Price",
      "Sale Value",
      "Movement",
      "Stock Status",
    ];

    const rows = filteredData.map((item) => {
      const stockValue =
        Number(item.currentStock || 0) * Number(item.purchasePrice || 0);

      const saleValue =
        Number(item.currentStock || 0) * Number(item.salePrice || 0);

      const stockStatus =
        Number(item.currentStock || 0) <= Number(item.reorderLevel || 0)
          ? "Low Stock"
          : "In Stock";

      return [
        item.product,
        item.sku,
        item.category,
        item.warehouse,
        item.openingStock,
        item.stockIn,
        item.stockOut,
        item.currentStock,
        item.reorderLevel,
        item.purchasePrice,
        stockValue,
        item.salePrice,
        saleValue,
        item.movement,
        stockStatus,
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "inventory-reports.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printContent =
      document.getElementById("inventory-report-print").innerHTML;

    const printWindow = window.open("", "", "width=1200,height=700");

    printWindow.document.write(`
      <html>
        <head>
          <title>Inventory Report</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #111827;
            }

            h1 {
              margin-bottom: 8px;
            }

            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 24px;
            }

            .card {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 14px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th,
            td {
              border: 1px solid #e5e7eb;
              padding: 10px;
              text-align: left;
              font-size: 13px;
            }

            th {
              background: #f3f4f6;
            }
          </style>
        </head>

        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <h1 className="text-3xl font-black">Inventory Reports</h1>

        <p className="mt-2 text-slate-300">
          Analyze stock valuation, movement, low stock and warehouse-wise inventory.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black">Report Filters</h2>

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
              placeholder="Search product, SKU..."
              className="w-full bg-transparent py-3 outline-none"
            />
          </div>

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
          >
            {warehouses.map((warehouse) => (
              <option key={warehouse} value={warehouse}>
                {warehouse === "All" ? "All Warehouses" : warehouse}
              </option>
            ))}
          </select>

          <select
            value={movementFilter}
            onChange={(e) => setMovementFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
          >
            <option value="All">All Movement</option>
            <option value="Fast Moving">Fast Moving</option>
            <option value="Medium Moving">Medium Moving</option>
            <option value="Slow Moving">Slow Moving</option>
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

      <div id="inventory-report-print">
        <div className="mb-6">
          <h1 className="text-2xl font-black">Inventory Report</h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Stock valuation, movement and low stock summary
          </p>
        </div>

        <div className="summary grid gap-5 md:grid-cols-4">
          <StatCard title="Total Stock Value" value={`₹${totalStockValue}`} />
          <StatCard title="Potential Sale Value" value={`₹${totalSaleValue}`} />
          <StatCard title="Fast Moving Items" value={fastMovingItems} />
          <StatCard title="Low Stock Items" value={lowStockItems} />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <StatCard title="Total Stock Qty" value={totalStockQty} />
          <StatCard title="Products Count" value={filteredData.length} />
          <StatCard title="Warehouses Used" value={warehouses.length - 1} />
        </div>
{/* Mobile Cards */}
<div className="mt-6 grid gap-4 md:hidden">
  {filteredData.map((item) => {
    const stockValue =
      Number(item.currentStock || 0) * Number(item.purchasePrice || 0);

    const isLowStock =
      Number(item.currentStock || 0) <= Number(item.reorderLevel || 0);

    return (
      <div
        key={item.id}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-black text-[var(--text)]">{item.product}</p>
            <p className="mt-1 text-sm font-medium text-[var(--muted)]">
              {item.sku} • {item.warehouse}
            </p>
          </div>

          <StatusBadge status={isLowStock ? "Low Stock" : "In Stock"} />
        </div>

        <div className="mb-4 rounded-2xl bg-[var(--surface-soft)] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--muted)]">
                Current Stock
              </p>
              <p className="mt-1 text-lg font-black text-[var(--text)]">
                {item.currentStock}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold uppercase text-[var(--muted)]">
                Stock Value
              </p>
              <p className="mt-1 text-lg font-black text-[var(--text)]">
                ₹{stockValue}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <MobileInfo label="Opening" value={item.openingStock} />
          <MobileInfo label="In" value={item.stockIn} />
          <MobileInfo label="Out" value={item.stockOut} />
          <MobileInfo label="Reorder" value={item.reorderLevel} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-soft)] p-3">
          <span className="text-xs font-bold uppercase text-[var(--muted)]">
            Movement
          </span>
          <MovementBadge movement={item.movement} />
        </div>
      </div>
    );
  })}

  {filteredData.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
      No inventory records found
    </div>
  )}
</div>

{/* Desktop Table */}
<div className="mt-6 hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[1200px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Product</Th>
        <Th>SKU</Th>
        <Th>Warehouse</Th>
        <Th>Opening</Th>
        <Th>In</Th>
        <Th>Out</Th>
        <Th>Current</Th>
        <Th>Reorder</Th>
        <Th>Stock Value</Th>
        <Th>Movement</Th>
        <Th>Status</Th>
      </tr>
    </thead>

    <tbody>
      {filteredData.map((item) => {
        const stockValue =
          Number(item.currentStock || 0) * Number(item.purchasePrice || 0);

        const isLowStock =
          Number(item.currentStock || 0) <= Number(item.reorderLevel || 0);

        return (
          <tr
            key={item.id}
            className="border-b border-[var(--border)] last:border-b-0"
          >
            <Td bold>{item.product}</Td>
            <Td>{item.sku}</Td>
            <Td>{item.warehouse}</Td>
            <Td>{item.openingStock}</Td>
            <Td>{item.stockIn}</Td>
            <Td>{item.stockOut}</Td>
            <Td bold>{item.currentStock}</Td>
            <Td>{item.reorderLevel}</Td>
            <Td bold>₹{stockValue}</Td>
            <Td>
              <MovementBadge movement={item.movement} />
            </Td>
            <Td>
              <StatusBadge status={isLowStock ? "Low Stock" : "In Stock"} />
            </Td>
          </tr>
        );
      })}

      {filteredData.length === 0 && (
        <tr>
          <td
            colSpan="11"
            className="px-5 py-10 text-center text-[var(--muted)]"
          >
            No inventory records found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Report Actions</h2>

        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-2 font-bold text-white"
          >
            <Download size={17} />
            Export CSV
          </button>

          <button
            onClick={printReport}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 font-bold text-white"
          >
            <Printer size={17} />
            Print Report
          </button>
        </div>
      </div>

      
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-sm font-bold text-[var(--muted)]">{title}</p>

      <h2 className="mt-2 text-2xl font-black">{value}</h2>
    </div>
  );
}

function MovementBadge({ movement }) {
  const styles = {
    "Fast Moving": "bg-green-100 text-green-700",
    "Medium Moving": "bg-yellow-100 text-yellow-700",
    "Slow Moving": "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[movement] || "bg-slate-100 text-slate-700"
      }`}
    >
      {movement}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "In Stock": "bg-green-100 text-green-700",
    "Low Stock": "bg-red-100 text-red-700",
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