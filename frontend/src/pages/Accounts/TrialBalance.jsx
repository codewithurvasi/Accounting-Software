import { useMemo, useState } from "react";
import {
  Download,
  Printer,
  RotateCcw,
  Search,
} from "lucide-react";

const trialBalanceData = [
  {
    account: "Cash Account",
    type: "Asset",
    debit: 56500,
    credit: 0,
  },
  {
    account: "Bank Account",
    type: "Asset",
    debit: 220000,
    credit: 0,
  },
  {
    account: "Accounts Receivable",
    type: "Asset",
    debit: 85000,
    credit: 0,
  },
  {
    account: "Purchase Account",
    type: "Expense",
    debit: 125000,
    credit: 0,
  },
  {
    account: "Rent Expense",
    type: "Expense",
    debit: 12000,
    credit: 0,
  },
  {
    account: "Accounts Payable",
    type: "Liability",
    debit: 0,
    credit: 65000,
  },
  {
    account: "GST Payable",
    type: "Liability",
    debit: 0,
    credit: 15000,
  },
  {
    account: "Capital Account",
    type: "Equity",
    debit: 0,
    credit: 500000,
  },
  {
    account: "Sales Revenue",
    type: "Income",
    debit: 0,
    credit: 503500,
  },
];

export default function TrialBalance() {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-05-31");

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    fromDate: "2026-05-01",
    toDate: "2026-05-31",
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
      fromDate,
      toDate,
    });
  };

  const filteredBalances = useMemo(() => {
    return trialBalanceData.filter((item) => {
      const text = `${item.account} ${item.type}`.toLowerCase();

      return text.includes(appliedFilters.search.toLowerCase());
    });
  }, [appliedFilters]);

  const totalDebit = filteredBalances.reduce(
    (sum, item) => sum + Number(item.debit || 0),
    0
  );

  const totalCredit = filteredBalances.reduce(
    (sum, item) => sum + Number(item.credit || 0),
    0
  );

  const difference = Math.abs(totalDebit - totalCredit);

  const isBalanced = totalDebit === totalCredit;

  const resetFilters = () => {
    setSearch("");
    setFromDate("2026-05-01");
    setToDate("2026-05-31");

    setAppliedFilters({
      search: "",
      fromDate: "2026-05-01",
      toDate: "2026-05-31",
    });
  };

  const exportCSV = () => {
    const headers = [
      "Account",
      "Type",
      "Debit",
      "Credit",
    ];

    const rows = filteredBalances.map((item) => [
      item.account,
      item.type,
      item.debit,
      item.credit,
    ]);

    rows.push([
      "TOTAL",
      "",
      totalDebit,
      totalCredit,
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
    link.download = "trial-balance.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printContent =
      document.getElementById("trial-balance-print").innerHTML;

    const printWindow = window.open("", "", "width=1200,height=700");

    printWindow.document.write(`
      <html>
        <head>
          <title>Trial Balance</title>

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
        <h1 className="text-3xl font-black">Trial Balance</h1>

        <p className="mt-2 text-slate-300">
          Verify debit and credit balances before preparing final reports.
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
                placeholder="Search account..."
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

          <div className="flex items-end md:col-span-2">
            <button
              onClick={generateReport}
              className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
            >
              Generate Trial Balance
            </button>
          </div>
        </div>
      </div>

      <div id="trial-balance-print">
        <div className="mb-6">
          <h1 className="text-2xl font-black">Trial Balance Report</h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Period: {appliedFilters.fromDate} to{" "}
            {appliedFilters.toDate}
          </p>
        </div>

        <div className="summary grid gap-5 md:grid-cols-4">
          <StatCard title="Total Debit" value={`₹${totalDebit}`} />

          <StatCard title="Total Credit" value={`₹${totalCredit}`} />

          <StatCard
            title="Difference"
            value={`₹${difference}`}
          />

          <div
            className={`card rounded-2xl border p-5 shadow-sm ${
              isBalanced
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <p className="text-sm font-bold text-[var(--muted)]">
              Status
            </p>

            <h2
              className={`mt-2 text-2xl font-black ${
                isBalanced
                  ? "text-green-700"
                  : "text-red-600"
              }`}
            >
              {isBalanced ? "Balanced" : "Mismatch"}
            </h2>
          </div>
        </div>

        {/* Mobile Cards */}
<div className="mt-6 grid gap-4 md:hidden">
  {filteredBalances.map((item) => (
    <div
      key={item.account}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="mb-3">
        <p className="font-semibold text-[var(--text)]">{item.account}</p>
        <p className="text-sm text-[var(--muted)]">{item.type}</p>
      </div>

      <div className="grid gap-2 text-sm">
        <MobileInfo label="Debit" value={item.debit ? `₹${item.debit}` : "-"} />
        <MobileInfo label="Credit" value={item.credit ? `₹${item.credit}` : "-"} />
      </div>
    </div>
  ))}

  {filteredBalances.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
      No records found
    </div>
  )}

  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 shadow-sm">
    <p className="mb-3 font-black text-[var(--text)]">TOTAL</p>

    <div className="grid gap-2 text-sm">
      <MobileInfo label="Total Debit" value={`₹${totalDebit}`} />
      <MobileInfo label="Total Credit" value={`₹${totalCredit}`} />
    </div>
  </div>
</div>

{/* Desktop Table */}
<div className="mt-6 hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[850px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Account</Th>
        <Th>Account Type</Th>
        <Th>Debit</Th>
        <Th>Credit</Th>
      </tr>
    </thead>

    <tbody>
      {filteredBalances.map((item) => (
        <tr
          key={item.account}
          className="border-b border-[var(--border)] last:border-b-0"
        >
          <Td bold>{item.account}</Td>
          <Td>{item.type}</Td>
          <Td>{item.debit ? `₹${item.debit}` : "-"}</Td>
          <Td>{item.credit ? `₹${item.credit}` : "-"}</Td>
        </tr>
      ))}

      {filteredBalances.length === 0 && (
        <tr>
          <td
            colSpan="4"
            className="px-5 py-10 text-center text-[var(--muted)]"
          >
            No records found
          </td>
        </tr>
      )}
    </tbody>

    <tfoot className="bg-[var(--surface-soft)]">
      <tr>
        <td className="px-5 py-4 font-black">TOTAL</td>
        <td></td>
        <td className="px-5 py-4 font-black">₹{totalDebit}</td>
        <td className="px-5 py-4 font-black">₹{totalCredit}</td>
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

function StatCard({ title, value }) {
  return (
    <div className="card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-sm font-bold text-[var(--muted)]">
        {title}
      </p>

      <h2 className="mt-2 text-2xl font-black">
        {value}
      </h2>
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