import { useMemo, useState } from "react";
import { Download, Printer, RotateCcw } from "lucide-react";

const balanceSheetData = [
  {
    id: 1,
    section: "Assets",
    group: "Current Assets",
    account: "Cash Account",
    amount: 56500,
  },
  {
    id: 2,
    section: "Assets",
    group: "Current Assets",
    account: "Bank Account",
    amount: 220000,
  },
  {
    id: 3,
    section: "Assets",
    group: "Current Assets",
    account: "Accounts Receivable",
    amount: 85000,
  },
  {
    id: 4,
    section: "Assets",
    group: "Current Assets",
    account: "Inventory Stock",
    amount: 845000,
  },
  {
    id: 5,
    section: "Assets",
    group: "Tax Assets",
    account: "GST Input Credit",
    amount: 8000,
  },
  {
    id: 6,
    section: "Liabilities",
    group: "Current Liabilities",
    account: "Accounts Payable",
    amount: 65000,
  },
  {
    id: 7,
    section: "Liabilities",
    group: "Tax Liabilities",
    account: "GST Payable",
    amount: 28000,
  },
  {
    id: 8,
    section: "Equity",
    group: "Owner Equity",
    account: "Capital Account",
    amount: 1028500,
  },
  {
    id: 9,
    section: "Equity",
    group: "Retained Earnings",
    account: "Current Year Profit",
    amount: 93000,
  },
];

export default function BalanceSheet() {
  const [asOnDate, setAsOnDate] = useState("2026-05-31");
  const [appliedDate, setAppliedDate] = useState("2026-05-31");

  const filteredData = useMemo(() => {
    return balanceSheetData;
  }, [appliedDate]);

  const assets = filteredData.filter((item) => item.section === "Assets");
  const liabilities = filteredData.filter((item) => item.section === "Liabilities");
  const equity = filteredData.filter((item) => item.section === "Equity");

  const totalAssets = assets.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalEquity = equity.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const liabilitiesAndEquity = totalLiabilities + totalEquity;
  const difference = totalAssets - liabilitiesAndEquity;
  const isBalanced = difference === 0;

  const generateReport = () => {
    setAppliedDate(asOnDate);
  };

  const resetFilters = () => {
    setAsOnDate("2026-05-31");
    setAppliedDate("2026-05-31");
  };

  const exportCSV = () => {
    const headers = ["Section", "Group", "Account", "Amount"];

    const rows = filteredData.map((item) => [
      item.section,
      item.group,
      item.account,
      item.amount,
    ]);

    rows.push(["", "", "Total Assets", totalAssets]);
    rows.push(["", "", "Total Liabilities", totalLiabilities]);
    rows.push(["", "", "Total Equity", totalEquity]);
    rows.push(["", "", "Difference", difference]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "balance-sheet.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printContent = document.getElementById("balance-sheet-print").innerHTML;
    const printWindow = window.open("", "", "width=1200,height=700");

    printWindow.document.write(`
      <html>
        <head>
          <title>Balance Sheet</title>
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
        <h1 className="text-3xl font-black">Balance Sheet</h1>
        <p className="mt-2 text-slate-300">
          Shows assets, liabilities and owner equity of the business.
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

        <div className="grid gap-4 md:grid-cols-4">
          <Input
            label="As On Date"
            type="date"
            value={asOnDate}
            onChange={(e) => setAsOnDate(e.target.value)}
          />

          <div className="flex items-end md:col-span-3">
            <button
              onClick={generateReport}
              className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
            >
              Generate Balance Sheet
            </button>
          </div>
        </div>
      </div>

      <div id="balance-sheet-print">
        <div className="mb-6">
          <h1 className="text-2xl font-black">Balance Sheet</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            As on: {appliedDate}
          </p>
        </div>

        <div className="summary grid gap-5 md:grid-cols-4">
          <StatCard title="Total Assets" value={`₹${totalAssets}`} />
          <StatCard title="Total Liabilities" value={`₹${totalLiabilities}`} />
          <StatCard title="Total Equity" value={`₹${totalEquity}`} />
          <StatCard
            title="Status"
            value={isBalanced ? "Balanced" : `Difference ₹${Math.abs(difference)}`}
            highlight={isBalanced ? "balanced" : "mismatch"}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ReportSection title="Assets" data={assets} total={totalAssets} />
          <ReportSection title="Liabilities" data={liabilities} total={totalLiabilities} />
          <ReportSection title="Equity" data={equity} total={totalEquity} />
        </div>

        {/* Mobile Cards */}
<div className="mt-6 grid gap-4 md:hidden">
  {filteredData.map((item) => (
    <div
      key={item.id}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="mb-3">
        <p className="font-black text-[var(--text)]">{item.account}</p>
        <p className="mt-1 text-sm font-medium text-[var(--muted)]">
          {item.section} • {item.group}
        </p>
      </div>

      <MobileInfo label="Amount" value={`₹${item.amount}`} strong />
    </div>
  ))}

  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 shadow-sm">
    <div className="grid gap-3 text-sm">
      <MobileInfo label="Total Assets" value={`₹${totalAssets}`} strong />
      <MobileInfo
        label="Total Liabilities + Equity"
        value={`₹${liabilitiesAndEquity}`}
        strong
      />

      <div className="rounded-xl bg-[var(--surface)] p-3">
        <p className="text-xs font-bold uppercase text-[var(--muted)]">
          Difference
        </p>
        <p
          className={`mt-1 text-sm font-black ${
            isBalanced ? "text-green-700" : "text-red-600"
          }`}
        >
          ₹{Math.abs(difference)}
        </p>
      </div>
    </div>
  </div>
</div>

{/* Desktop Table */}
<div className="mt-6 hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[900px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Section</Th>
        <Th>Group</Th>
        <Th>Account</Th>
        <Th>Amount</Th>
      </tr>
    </thead>

    <tbody>
      {filteredData.map((item) => (
        <tr
          key={item.id}
          className="border-b border-[var(--border)] last:border-b-0"
        >
          <Td>{item.section}</Td>
          <Td>{item.group}</Td>
          <Td bold>{item.account}</Td>
          <Td bold>₹{item.amount}</Td>
        </tr>
      ))}
    </tbody>

    <tfoot className="bg-[var(--surface-soft)]">
      <tr>
        <td className="px-5 py-4 font-black" colSpan="3">
          Total Assets
        </td>
        <td className="px-5 py-4 font-black">₹{totalAssets}</td>
      </tr>

      <tr>
        <td className="px-5 py-4 font-black" colSpan="3">
          Total Liabilities + Equity
        </td>
        <td className="px-5 py-4 font-black">₹{liabilitiesAndEquity}</td>
      </tr>

      <tr>
        <td className="px-5 py-4 font-black" colSpan="3">
          Difference
        </td>
        <td
          className={`px-5 py-4 font-black ${
            isBalanced ? "text-green-700" : "text-red-600"
          }`}
        >
          ₹{Math.abs(difference)}
        </td>
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

function ReportSection({ title, data, total }) {
  const grouped = data.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="border-b border-[var(--border)] p-5">
        <h2 className="text-xl font-black">{title}</h2>
      </div>

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          <div className="bg-[var(--surface-soft)] px-5 py-3 text-sm font-black">
            {group}
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b border-[var(--border)] px-5 py-4 last:border-b-0"
            >
              <span className="font-bold">{item.account}</span>
              <span>₹{item.amount}</span>
            </div>
          ))}
        </div>
      ))}

      <div className="flex justify-between bg-[var(--surface-soft)] px-5 py-4 font-black">
        <span>Total {title}</span>
        <span>₹{total}</span>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      />
    </div>
  );
}

function StatCard({ title, value, highlight }) {
  const color =
    highlight === "balanced"
      ? "text-green-700"
      : highlight === "mismatch"
      ? "text-red-600"
      : "";

  return (
    <div className="card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-sm font-bold text-[var(--muted)]">{title}</p>
      <h2 className={`mt-2 text-2xl font-black ${color}`}>{value}</h2>
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
  return ( <div className="rounded-xl bg-[var(--surface-soft)] p-3"> <p className="text-xs font-bold uppercase text-[var(--muted)]"> {label} </p> <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}> {value || "-"} </p> </div> ); }