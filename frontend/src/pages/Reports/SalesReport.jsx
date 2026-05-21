import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Download, Printer, RotateCcw, Search } from "lucide-react";
import {
  getCustomerName,
  getGstAmount,
  getInvoiceDate,
  getInvoiceNo,
  getInvoices,
  getInvoiceStatus,
  getInvoiceTotal,
  getPaidAmount,
  getTaxableAmount,
} from "../../utils/reportHelpers";


export default function SalesReport() {
  const invoices = useSelector((state) => state.invoices?.invoices || []);
const payments = useSelector((state) => state.payments?.payments || []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
 const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    statusFilter: "All",
    fromDate: "",
toDate: "",
  });

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

  const salesRows = useMemo(() => {
  return invoices.map((invoice) => {
    const totalAmount = getInvoiceTotal(invoice);
    const paidAmount =
  Number(invoice.paidAmount || invoice.receivedAmount || 0) ||
  payments
    .filter(
      (p) =>
        String(p.invoiceNo || p.invoice || "") ===
        String(invoice.invoiceNo || invoice.id || "")
    )
    .reduce((sum, p) => sum + Number(p.amount || p.receivedAmount || 0), 0);

    const taxableAmount = Number(
  invoice.subtotal ||
    invoice.taxableAmount ||
    getTaxableAmount(invoice) ||
    0
);

const gstAmount = Number(
  invoice.gstAmount ||
    invoice.tax ||
    getGstAmount(invoice) ||
    0
);

return {
  id: invoice.id || getInvoiceNo(invoice),
  date: getInvoiceDate(invoice),
  invoice: getInvoiceNo(invoice),
  customer: getCustomerName(invoice),
  salesPerson: invoice.salesPerson || "Admin User",

  taxableAmount: Number.isFinite(taxableAmount)
    ? taxableAmount
    : 0,

  gstAmount: Number.isFinite(gstAmount)
    ? gstAmount
    : 0,

  totalAmount: Number(totalAmount || 0),

  paidAmount: Number(paidAmount || 0),

  status: getInvoiceStatus(invoice),
};
  });
}, [invoices, payments]);

console.log("Sales Report Rows:", salesRows);

  const filteredSales = useMemo(() => {
   return salesRows.filter((sale) => {
      const text = `${sale.invoice} ${sale.customer} ${sale.salesPerson}`.toLowerCase();

      const matchesSearch = text.includes(appliedFilters.search.toLowerCase());

      const matchesStatus =
        appliedFilters.statusFilter === "All" ||
        sale.status === appliedFilters.statusFilter;

      const saleDate = new Date(sale.date);

const matchesFrom = appliedFilters.fromDate
  ? saleDate >= new Date(appliedFilters.fromDate)
  : true;

const matchesTo = appliedFilters.toDate
  ? saleDate <= new Date(appliedFilters.toDate)
  : true;

return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [appliedFilters, salesRows]);
  const totalSales = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount || 0),
    0
  );

  const taxableSales = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.taxableAmount || 0),
    0
  );

  const totalGst = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.gstAmount || 0),
    0
  );

  const paidSales = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.paidAmount || 0),
    0
  );

  const pendingSales = totalSales - paidSales;

  const exportCSV = () => {
    const headers = [
      "Date",
      "Invoice",
      "Customer",
      "Sales Person",
      "Taxable Amount",
      "GST Amount",
      "Total Amount",
      "Paid Amount",
      "Pending Amount",
      "Status",
    ];

    const rows = filteredSales.map((sale) => [
      sale.date,
      sale.invoice,
      sale.customer,
      sale.salesPerson,
      sale.taxableAmount,
      sale.gstAmount,
      sale.totalAmount,
      sale.paidAmount,
      sale.totalAmount - sale.paidAmount,
      sale.status,
    ]);

    rows.push(["", "", "", "TOTAL", taxableSales, totalGst, totalSales, paidSales, pendingSales, ""]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sales-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printContent = document.getElementById("sales-report-print").innerHTML;
    const printWindow = window.open("", "", "width=1200,height=700");

    printWindow.document.write(`
      <html>
        <head>
          <title>Sales Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #111827;
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
              margin-top: 16px;
            }

            th, td {
              border: 1px solid #e5e7eb;
              padding: 10px;
              text-align: left;
              font-size: 13px;
            }

            th {
              background: #f3f4f6;
            }

            tfoot td {
              font-weight: bold;
              background: #f9fafb;
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
        <h1 className="text-3xl font-black">Sales Report</h1>

        <p className="mt-2 text-slate-300">
          Analyze sales invoices, customer revenue, GST and payment status.
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
          <div className="flex items-end">
            <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
              <Search size={18} className="text-[var(--muted)]" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice, customer..."
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>
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

      <div id="sales-report-print">
        <div className="mb-6">
          <h1 className="text-2xl font-black">Sales Report</h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Period: {appliedFilters.fromDate} to {appliedFilters.toDate}
          </p>
        </div>

        <div className="summary grid gap-5 md:grid-cols-4">
          <StatCard title="Total Sales" value={`₹${totalSales}`} />
          <StatCard title="Taxable Sales" value={`₹${taxableSales}`} />
          <StatCard title="GST Collected" value={`₹${totalGst}`} />
          <StatCard title="Pending Amount" value={`₹${pendingSales}`} highlight="loss" />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <StatCard title="Paid Amount" value={`₹${paidSales}`} highlight="profit" />
          <StatCard title="Invoices" value={filteredSales.length} />
          <StatCard
            title="Average Invoice Value"
            value={`₹${filteredSales.length ? Math.round(totalSales / filteredSales.length) : 0}`}
          />
        </div>

       {/* Mobile Cards */}
<div className="mt-6 grid gap-4 md:hidden">
  {filteredSales.map((sale) => {
    const pending = sale.totalAmount - sale.paidAmount;

    return (
      <div
        key={sale.id}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-black text-[var(--text)]">{sale.invoice}</p>
            <p className="mt-1 text-sm font-medium text-[var(--muted)]">
              {sale.customer} • {sale.date}
            </p>
          </div>

          <StatusBadge status={sale.status} />
        </div>

        <div className="mb-4 rounded-2xl bg-[var(--surface-soft)] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--muted)]">
                Total
              </p>
              <p className="mt-1 text-lg font-black text-[var(--text)]">
                ₹{sale.totalAmount}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold uppercase text-[var(--muted)]">
                Pending
              </p>
              <p className="mt-1 text-lg font-black text-red-600">
                ₹{pending}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <MobileInfo label="Sales Person" value={sale.salesPerson} />
          <MobileInfo label="Amount" value={`₹${sale.taxableAmount}`} />
          <MobileInfo label="GST" value={`₹${sale.gstAmount}`} />
          <MobileInfo label="Paid" value={`₹${sale.paidAmount}`} />
        </div>
      </div>
    );
  })}

  {filteredSales.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
      No sales records found
    </div>
  )}

  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 shadow-sm">
    <p className="mb-3 font-black text-[var(--text)]">Total</p>

    <div className="grid grid-cols-2 gap-3 text-sm">
      <MobileInfo label="Amount" value={`₹${taxableSales}`} strong />
      <MobileInfo label="GST" value={`₹${totalGst}`} strong />
      <MobileInfo label="Sales" value={`₹${totalSales}`} strong />
      <MobileInfo label="Paid" value={`₹${paidSales}`} strong />
      <MobileInfo label="Pending" value={`₹${pendingSales}`} strong />
    </div>
  </div>
</div>

{/* Desktop Table */}
<div className="mt-6 hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[1150px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Date</Th>
        <Th>Invoice</Th>
        <Th>Customer</Th>
        <Th>Sales Person</Th>
        <Th>Amount</Th>
        <Th>GST</Th>
        <Th>Total</Th>
        <Th>Paid</Th>
        <Th>Pending</Th>
        <Th>Status</Th>
      </tr>
    </thead>

    <tbody>
      {filteredSales.map((sale) => (
        <tr
          key={sale.id}
          className="border-b border-[var(--border)] last:border-b-0"
        >
          <Td>{sale.date}</Td>
          <Td bold>{sale.invoice}</Td>
          <Td>{sale.customer}</Td>
          <Td>{sale.salesPerson}</Td>
          <Td>₹{sale.taxableAmount}</Td>
          <Td>₹{sale.gstAmount}</Td>
          <Td bold>₹{sale.totalAmount}</Td>
          <Td>₹{sale.paidAmount}</Td>
          <Td>₹{sale.totalAmount - sale.paidAmount}</Td>
          <Td>
            <StatusBadge status={sale.status} />
          </Td>
        </tr>
      ))}

      {filteredSales.length === 0 && (
        <tr>
          <td
            colSpan="10"
            className="px-5 py-10 text-center text-[var(--muted)]"
          >
            No sales records found
          </td>
        </tr>
      )}
    </tbody>

    <tfoot className="bg-[var(--surface-soft)]">
      <tr>
        <td className="px-5 py-4 font-black" colSpan="4">
          Total
        </td>
        <td className="px-5 py-4 font-black">₹{taxableSales}</td>
        <td className="px-5 py-4 font-black">₹{totalGst}</td>
        <td className="px-5 py-4 font-black">₹{totalSales}</td>
        <td className="px-5 py-4 font-black">₹{paidSales}</td>
        <td className="px-5 py-4 font-black">₹{pendingSales}</td>
        <td></td>
      </tr>
    </tfoot>
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

function Input({ label, value, onChange, type = "text", min }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

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

function StatCard({ title, value, highlight }) {
  const color =
    highlight === "profit"
      ? "text-green-700"
      : highlight === "loss"
      ? "text-red-600"
      : "";

  return (
    <div className="card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-sm font-bold text-[var(--muted)]">{title}</p>
      <h2 className={`mt-2 text-2xl font-black ${color}`}>{value}</h2>
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
  return <td className={`px-5 py-4 ${bold ? "font-bold" : ""}`}>{children}</td>;
}
function MobileInfo({ label, value, strong }) {
   return ( <div className="rounded-xl bg-[var(--surface-soft)] p-3"> <p className="text-xs font-bold uppercase text-[var(--muted)]"> {label} </p> <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}> {value || "-"} </p> </div> ); }