import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Download,
  Eye,
  Pencil,
  Printer,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

const initialPurchaseData = [
  {
    id: 1,
    date: "2026-05-01",
    bill: "BILL-001",
    vendor: "Fabric World",
    purchaseType: "Goods",
    taxableAmount: 25000,
    gstAmount: 4500,
    totalAmount: 29500,
    paidAmount: 29500,
    dueDate: "2026-05-10",
    paymentMode: "Bank Transfer",
    status: "Paid",
    notes: "Fabric material purchase",
  },
  {
    id: 2,
    date: "2026-05-06",
    bill: "BILL-002",
    vendor: "Textile Supplier",
    purchaseType: "Goods",
    taxableAmount: 14500,
    gstAmount: 2610,
    totalAmount: 17110,
    paidAmount: 0,
    dueDate: "2026-05-18",
    paymentMode: "Pending",
    status: "Pending",
    notes: "Cotton stock purchase",
  },
  {
    id: 3,
    date: "2026-05-10",
    bill: "BILL-003",
    vendor: "Packaging House",
    purchaseType: "Expense",
    taxableAmount: 8200,
    gstAmount: 1476,
    totalAmount: 9676,
    paidAmount: 5000,
    dueDate: "2026-05-20",
    paymentMode: "UPI",
    status: "Partial",
    notes: "Packaging material purchase",
  },
];

export default function PurchaseReport() {
  const bills = useSelector((state) => state.bills?.bills || []);

const purchases = bills.map((bill) => {
  const taxableAmount = bill.items?.reduce(
    (sum, item) => sum + Number(item.qty || 0) * Number(item.rate || 0),
    0
  );

  const gstAmount = bill.items?.reduce((sum, item) => {
    const amount = Number(item.qty || 0) * Number(item.rate || 0);
    return sum + (amount * Number(item.gst || 0)) / 100;
  }, 0);

  const totalAmount = Number(bill.amount || bill.total || taxableAmount + gstAmount || 0);
  const paidAmount = Number(bill.paidAmount || 0);

  return {
    id: bill.id,
    date: bill.billDate,
    bill: bill.billNo,
    vendor: bill.vendor,
    purchaseType: "Goods",
    taxableAmount,
    gstAmount,
    totalAmount,
    paidAmount,
    dueDate: bill.dueDate,
    paymentMode: bill.paymentMode || "Pending",
    status: bill.status === "Unpaid" ? "Pending" : bill.status,
    notes: bill.notes || "",
  };
});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-05-31");

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    statusFilter: "All",
    fromDate: "2026-05-01",
    toDate: "2026-05-31",
  });

  const [viewPurchase, setViewPurchase] = useState(null);
  const [editPurchase, setEditPurchase] = useState(null);

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

  const generateReport = () => {
    if (new Date(toDate) < new Date(fromDate)) {
      alert("End Date cannot be before Start Date");
      return;
    }

    setAppliedFilters({
      search,
      statusFilter,
      fromDate,
      toDate,
    });
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setFromDate("2026-05-01");
    setToDate("2026-05-31");

    setAppliedFilters({
      search: "",
      statusFilter: "All",
      fromDate: "2026-05-01",
      toDate: "2026-05-31",
    });
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      const text =
        `${purchase.bill} ${purchase.vendor} ${purchase.purchaseType}`.toLowerCase();

      const matchesSearch = text.includes(
        appliedFilters.search.toLowerCase()
      );

      const matchesStatus =
        appliedFilters.statusFilter === "All" ||
        purchase.status === appliedFilters.statusFilter;

      const purchaseDate = new Date(purchase.date);

      const matchesFrom =
        purchaseDate >= new Date(appliedFilters.fromDate);

      const matchesTo =
        purchaseDate <= new Date(appliedFilters.toDate);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [purchases, appliedFilters]);

  const totalPurchases = filteredPurchases.reduce(
    (sum, item) => sum + Number(item.totalAmount || 0),
    0
  );

  const taxablePurchases = filteredPurchases.reduce(
    (sum, item) => sum + Number(item.taxableAmount || 0),
    0
  );

  const gstAmount = filteredPurchases.reduce(
    (sum, item) => sum + Number(item.gstAmount || 0),
    0
  );

  const paidAmount = filteredPurchases.reduce(
    (sum, item) => sum + Number(item.paidAmount || 0),
    0
  );

  const outstandingAmount = totalPurchases - paidAmount;

  const exportCSV = () => {
    const headers = [
      "Date",
      "Bill",
      "Vendor",
      "Purchase Type",
      "Taxable Amount",
      "GST",
      "Total",
      "Paid",
      "Outstanding",
      "Status",
    ];

    const rows = filteredPurchases.map((item) => [
      item.date,
      item.bill,
      item.vendor,
      item.purchaseType,
      item.taxableAmount,
      item.gstAmount,
      item.totalAmount,
      item.paidAmount,
      item.totalAmount - item.paidAmount,
      item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "purchase-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printContent =
      document.getElementById("purchase-report-print").innerHTML;

    const printWindow = window.open("", "", "width=1200,height=700");

    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Report</title>

          <style>
            body{
              font-family: Arial;
              padding:20px;
              color:#111827;
            }

            table{
              width:100%;
              border-collapse:collapse;
              margin-top:20px;
            }

            th,td{
              border:1px solid #e5e7eb;
              padding:10px;
              text-align:left;
              font-size:13px;
            }

            th{
              background:#f3f4f6;
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

  // const updatePurchase = () => {
  //   setPurchases((prev) =>
  //     prev.map((item) =>
  //       item.id === editPurchase.id ? editPurchase : item
  //     )
  //   );

  //   setEditPurchase(null);
  // };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <h1 className="text-3xl font-black">Purchase Report</h1>

        <p className="mt-2 text-slate-300">
          Analyze vendor purchases, GST, payment status and liabilities.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black">Filters</h2>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="flex items-end">
            <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
              <Search size={18} className="text-[var(--muted)]" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search purchase..."
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={fromDate}
            onChange={(e) =>
              handleFromDateChange(e.target.value)
            }
          />

          <Input
            label="End Date"
            type="date"
            value={toDate}
            min={fromDate}
            onChange={(e) =>
              handleToDateChange(e.target.value)
            }
          />

          <div>
            <label className="mb-1 block text-sm font-bold">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div id="purchase-report-print">
        <div className="grid gap-5 md:grid-cols-4">
          <StatCard
            title="Total Purchases"
            value={`₹${totalPurchases}`}
          />

          <StatCard
            title="Taxable Purchases"
            value={`₹${taxablePurchases}`}
          />

          <StatCard
            title="GST Amount"
            value={`₹${gstAmount}`}
          />

          <StatCard
            title="Outstanding"
            value={`₹${outstandingAmount}`}
            color="text-red-600"
          />
        </div>

      {/* Mobile Cards */}
<div className="mt-6 grid gap-4 md:hidden">
  {filteredPurchases.map((item) => {
    const outstanding = item.totalAmount - item.paidAmount;

    return (
      <div
        key={item.id}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-black text-[var(--text)]">{item.bill}</p>
            <p className="mt-1 text-sm font-medium text-[var(--muted)]">
              {item.vendor} • {item.date}
            </p>
          </div>

          <StatusBadge status={item.status} />
        </div>

        <div className="mb-4 rounded-2xl bg-[var(--surface-soft)] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--muted)]">
                Total
              </p>
              <p className="mt-1 text-lg font-black text-[var(--text)]">
                ₹{item.totalAmount}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold uppercase text-[var(--muted)]">
                Outstanding
              </p>
              <p className="mt-1 text-lg font-black text-red-600">
                ₹{outstanding}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <MobileInfo label="Type" value={item.purchaseType} />
          <MobileInfo label="Taxable" value={`₹${item.taxableAmount}`} />
          <MobileInfo label="GST" value={`₹${item.gstAmount}`} />
          <MobileInfo label="Paid" value={`₹${item.paidAmount}`} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewPurchase(item)}
            className="rounded-lg bg-blue-100 p-2 text-blue-700"
          >
            <Eye size={16} />
          </button>

          {/* <button
            onClick={() => setEditPurchase(item)}
            className="rounded-lg bg-amber-100 p-2 text-amber-700"
          >
            <Pencil size={16} />
          </button> */}
        </div>
      </div>
    );
  })}

  {filteredPurchases.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
      No purchase records found
    </div>
  )}
</div>

{/* Desktop Table */}
<div className="mt-6 hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[1200px] text-left">
    <thead className="bg-[var(--surface-soft)]">
      <tr>
        <Th>Date</Th>
        <Th>Bill</Th>
        <Th>Vendor</Th>
        <Th>Type</Th>
        <Th>Taxable</Th>
        <Th>GST</Th>
        <Th>Total</Th>
        <Th>Paid</Th>
        <Th>Outstanding</Th>
        <Th>Status</Th>
        <Th>Actions</Th>
      </tr>
    </thead>

    <tbody>
      {filteredPurchases.map((item) => (
        <tr
          key={item.id}
          className="border-b border-[var(--border)]"
        >
          <Td>{item.date}</Td>
          <Td bold>{item.bill}</Td>
          <Td>{item.vendor}</Td>
          <Td>{item.purchaseType}</Td>
          <Td>₹{item.taxableAmount}</Td>
          <Td>₹{item.gstAmount}</Td>
          <Td bold>₹{item.totalAmount}</Td>
          <Td>₹{item.paidAmount}</Td>
          <Td>₹{item.totalAmount - item.paidAmount}</Td>
          <Td>
            <StatusBadge status={item.status} />
          </Td>
          <Td>
            <div className="flex gap-2">
              <button
                onClick={() => setViewPurchase(item)}
                className="rounded-lg bg-blue-100 p-2 text-blue-700"
              >
                <Eye size={16} />
              </button>

              {/* <button
                onClick={() => setEditPurchase(item)}
                className="rounded-lg bg-amber-100 p-2 text-amber-700"
              >
                <Pencil size={16} />
              </button> */}
            </div>
          </Td>
        </tr>
      ))}

      {filteredPurchases.length === 0 && (
        <tr>
          <td
            colSpan="11"
            className="px-5 py-10 text-center text-[var(--muted)]"
          >
            No purchase records found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Actions</h2>

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
            Print
          </button>
        </div>
      </div>

      {viewPurchase && (
        <Modal
          title="Purchase Details"
          onClose={() => setViewPurchase(null)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ViewField label="Bill No" value={viewPurchase.bill} />
            <ViewField label="Vendor" value={viewPurchase.vendor} />
            <ViewField label="Date" value={viewPurchase.date} />
            <ViewField
              label="Purchase Type"
              value={viewPurchase.purchaseType}
            />
            <ViewField
              label="Taxable Amount"
              value={`₹${viewPurchase.taxableAmount}`}
            />
            <ViewField
              label="GST Amount"
              value={`₹${viewPurchase.gstAmount}`}
            />
            <ViewField
              label="Total Amount"
              value={`₹${viewPurchase.totalAmount}`}
            />
            <ViewField
              label="Paid Amount"
              value={`₹${viewPurchase.paidAmount}`}
            />
            <ViewField
              label="Outstanding"
              value={`₹${
                viewPurchase.totalAmount -
                viewPurchase.paidAmount
              }`}
            />
            <ViewField
              label="Payment Mode"
              value={viewPurchase.paymentMode}
            />
            <ViewField
              label="Due Date"
              value={viewPurchase.dueDate}
            />
            <ViewField
              label="Status"
              value={viewPurchase.status}
            />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-bold">Notes</p>

            <div className="rounded-xl bg-[var(--surface-soft)] p-4 text-sm">
              {viewPurchase.notes}
            </div>
          </div>
        </Modal>
      )}

      {editPurchase && (
        <Modal
          title="Edit Purchase"
          onClose={() => setEditPurchase(null)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Vendor"
              value={editPurchase.vendor}
              onChange={(e) =>
                setEditPurchase({
                  ...editPurchase,
                  vendor: e.target.value,
                })
              }
            />

            <Input
              label="Purchase Type"
              value={editPurchase.purchaseType}
              onChange={(e) =>
                setEditPurchase({
                  ...editPurchase,
                  purchaseType: e.target.value,
                })
              }
            />

            <Input
              label="Taxable Amount"
              type="number"
              value={editPurchase.taxableAmount}
              onChange={(e) =>
                setEditPurchase({
                  ...editPurchase,
                  taxableAmount: Number(e.target.value),
                })
              }
            />

            <Input
              label="GST Amount"
              type="number"
              value={editPurchase.gstAmount}
              onChange={(e) =>
                setEditPurchase({
                  ...editPurchase,
                  gstAmount: Number(e.target.value),
                })
              }
            />

            <Input
              label="Paid Amount"
              type="number"
              value={editPurchase.paidAmount}
              onChange={(e) =>
                setEditPurchase({
                  ...editPurchase,
                  paidAmount: Number(e.target.value),
                })
              }
            />

            <div>
              <label className="mb-1 block text-sm font-bold">
                Status
              </label>

              <select
                value={editPurchase.status}
                onChange={(e) =>
                  setEditPurchase({
                    ...editPurchase,
                    status: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option>Paid</option>
                <option>Partial</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={updatePurchase}
              className="rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white"
            >
              Update Purchase
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  min,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">
        {label}
      </label>

      <input
        type={type}
        value={value}
        min={min}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      />
    </div>
  );
}

function StatCard({ title, value, color = "" }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-sm font-bold text-[var(--muted)]">
        {title}
      </p>

      <h2 className={`mt-2 text-2xl font-black ${color}`}>
        {value}
      </h2>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Paid: "bg-green-100 text-green-700",
    Partial: "bg-yellow-100 text-yellow-700",
    Pending: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 p-2"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ViewField({ label, value }) {
  return (
    <div className="rounded-xl bg-[var(--surface-soft)] p-4">
      <p className="text-xs font-bold uppercase text-[var(--muted)]">
        {label}
      </p>

      <h3 className="mt-2 font-bold">{value}</h3>
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
  return (
    <td className={`px-5 py-4 ${bold ? "font-bold" : ""}`}>
      {children}
    </td>
  );
}
function MobileInfo({ label, value, strong }) { return ( <div className="rounded-xl bg-[var(--surface-soft)] p-3"> <p className="text-xs font-bold uppercase text-[var(--muted)]"> {label} </p> <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}> {value || "-"} </p> </div> ); }