import { useMemo, useState } from "react";
import { Download, Printer, RotateCcw, Search } from "lucide-react";

const cashFlowData = [
  {
    id: 1,
    date: "2026-05-01",
    section: "Operating Activities",
    account: "Customer Payments",
    description: "Cash received from customers",
    type: "Inflow",
    amount: 185000,
  },
  {
    id: 2,
    date: "2026-05-05",
    section: "Operating Activities",
    account: "Vendor Payments",
    description: "Cash paid to vendors",
    type: "Outflow",
    amount: 75000,
  },
  {
    id: 3,
    date: "2026-05-08",
    section: "Operating Activities",
    account: "Business Expenses",
    description: "Rent, salary and office expenses paid",
    type: "Outflow",
    amount: 32000,
  },
  {
    id: 4,
    date: "2026-05-10",
    section: "Investing Activities",
    account: "Fixed Assets",
    description: "Equipment purchase",
    type: "Outflow",
    amount: 45000,
  },
  {
    id: 5,
    date: "2026-05-11",
    section: "Financing Activities",
    account: "Capital Account",
    description: "Capital introduced by owner",
    type: "Inflow",
    amount: 50000,
  },
];

export default function CashFlow() {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-05-31");
  const [openingBalance, setOpeningBalance] = useState(125000);

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    fromDate: "2026-05-01",
    toDate: "2026-05-31",
    openingBalance: 125000,
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
      openingBalance: Number(openingBalance || 0),
    });
  };

  const resetFilters = () => {
    setSearch("");
    setFromDate("2026-05-01");
    setToDate("2026-05-31");
    setOpeningBalance(125000);

    setAppliedFilters({
      search: "",
      fromDate: "2026-05-01",
      toDate: "2026-05-31",
      openingBalance: 125000,
    });
  };

  const filteredData = useMemo(() => {
    return cashFlowData.filter((item) => {
      const text = `${item.section} ${item.account} ${item.description} ${item.type}`.toLowerCase();

      const matchesSearch = text.includes(appliedFilters.search.toLowerCase());

      const itemDate = new Date(item.date);
      const matchesFrom = itemDate >= new Date(appliedFilters.fromDate);
      const matchesTo = itemDate <= new Date(appliedFilters.toDate);

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [appliedFilters]);

  const totalInflow = filteredData
    .filter((item) => item.type === "Inflow")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalOutflow = filteredData
    .filter((item) => item.type === "Outflow")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const netCashFlow = totalInflow - totalOutflow;
  const closingBalance = appliedFilters.openingBalance + netCashFlow;

  const getSectionTotal = (section) => {
    return filteredData
      .filter((item) => item.section === section)
      .reduce((sum, item) => {
        return item.type === "Inflow"
          ? sum + Number(item.amount || 0)
          : sum - Number(item.amount || 0);
      }, 0);
  };

  const exportCSV = () => {
    const headers = ["Date", "Section", "Account", "Description", "Type", "Amount"];

    const rows = filteredData.map((item) => [
      item.date,
      item.section,
      item.account,
      item.description,
      item.type,
      item.amount,
    ]);

    rows.push(["", "", "", "Opening Balance", "", appliedFilters.openingBalance]);
    rows.push(["", "", "", "Total Inflow", "", totalInflow]);
    rows.push(["", "", "", "Total Outflow", "", totalOutflow]);
    rows.push(["", "", "", "Net Cash Flow", "", netCashFlow]);
    rows.push(["", "", "", "Closing Balance", "", closingBalance]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "cash-flow-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printContent = document.getElementById("cash-flow-print").innerHTML;
    const printWindow = window.open("", "", "width=1200,height=700");

    printWindow.document.write(`
      <html>
        <head>
          <title>Cash Flow Report</title>
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

  const sections = [
    "Operating Activities",
    "Investing Activities",
    "Financing Activities",
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <h1 className="text-3xl font-black">Cash Flow Report</h1>
        <p className="mt-2 text-slate-300">
          Track cash inflow and outflow from operating, investing and financing activities.
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
                placeholder="Search cash flow..."
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

          <Input
            label="Opening Balance"
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
          />

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

      <div id="cash-flow-print">
        <div className="mb-6">
          <h1 className="text-2xl font-black">Cash Flow Report</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Period: {appliedFilters.fromDate} to {appliedFilters.toDate}
          </p>
        </div>

        <div className="summary grid gap-5 md:grid-cols-4">
          <StatCard title="Opening Balance" value={`₹${appliedFilters.openingBalance}`} />
          <StatCard title="Total Inflow" value={`₹${totalInflow}`} highlight="profit" />
          <StatCard title="Total Outflow" value={`₹${totalOutflow}`} highlight="loss" />
          <StatCard
            title="Closing Balance"
            value={`₹${closingBalance}`}
            highlight={closingBalance >= 0 ? "profit" : "loss"}
          />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <StatCard
            title="Net Cash Flow"
            value={`₹${Math.abs(netCashFlow)}`}
            highlight={netCashFlow >= 0 ? "profit" : "loss"}
          />

          <StatCard
            title="Operating Cash Flow"
            value={`₹${getSectionTotal("Operating Activities")}`}
          />

          <StatCard
            title="Transactions"
            value={filteredData.length}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {sections.map((section) => (
            <CashFlowSection
              key={section}
              title={section}
              data={filteredData.filter((item) => item.section === section)}
              total={getSectionTotal(section)}
            />
          ))}
        </div>
{/* Mobile Cards */}
<div className="mt-6 grid gap-4 md:hidden">
  {filteredData.map((item) => (
    <div
      key={item.id}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-[var(--text)]">{item.account}</p>
          <p className="mt-1 text-sm font-medium text-[var(--muted)]">
            {item.section} • {item.date}
          </p>
        </div>

        <TypeBadge type={item.type} />
      </div>

      <div className="mb-4 rounded-2xl bg-[var(--surface-soft)] p-3">
        <p className="text-xs font-bold uppercase text-[var(--muted)]">
          Amount
        </p>
        <p
          className={`mt-1 text-lg font-black ${
            item.type === "Inflow" ? "text-green-700" : "text-red-600"
          }`}
        >
          {item.type === "Inflow" ? "+" : "-"}₹{item.amount}
        </p>
      </div>

      <div className="grid gap-3 text-sm">
        <MobileInfo label="Description" value={item.description} />
      </div>
    </div>
  ))}

  {filteredData.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
      No cash flow records found
    </div>
  )}

  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 shadow-sm">
    <div className="grid gap-3 text-sm">
      <div className="rounded-xl bg-[var(--surface)] p-3">
        <p className="text-xs font-bold uppercase text-[var(--muted)]">
          Net Cash Flow
        </p>
        <p
          className={`mt-1 text-sm font-black ${
            netCashFlow >= 0 ? "text-green-700" : "text-red-600"
          }`}
        >
          ₹{netCashFlow}
        </p>
      </div>

      <div className="rounded-xl bg-[var(--surface)] p-3">
        <p className="text-xs font-bold uppercase text-[var(--muted)]">
          Closing Balance
        </p>
        <p
          className={`mt-1 text-sm font-black ${
            closingBalance >= 0 ? "text-green-700" : "text-red-600"
          }`}
        >
          ₹{closingBalance}
        </p>
      </div>
    </div>
  </div>
</div>

{/* Desktop Table */}
<div className="mt-6 hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[950px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Date</Th>
        <Th>Section</Th>
        <Th>Account</Th>
        <Th>Description</Th>
        <Th>Type</Th>
        <Th>Amount</Th>
      </tr>
    </thead>

    <tbody>
      {filteredData.map((item) => (
        <tr
          key={item.id}
          className="border-b border-[var(--border)] last:border-b-0"
        >
          <Td>{item.date}</Td>
          <Td>{item.section}</Td>
          <Td bold>{item.account}</Td>
          <Td>{item.description}</Td>
          <Td>
            <TypeBadge type={item.type} />
          </Td>
          <Td bold>
            <span
              className={
                item.type === "Inflow" ? "text-green-700" : "text-red-600"
              }
            >
              {item.type === "Inflow" ? "+" : "-"}₹{item.amount}
            </span>
          </Td>
        </tr>
      ))}

      {filteredData.length === 0 && (
        <tr>
          <td
            colSpan="6"
            className="px-5 py-10 text-center text-[var(--muted)]"
          >
            No cash flow records found
          </td>
        </tr>
      )}
    </tbody>

    <tfoot className="bg-[var(--surface-soft)]">
      <tr>
        <td className="px-5 py-4 font-black" colSpan="5">
          Net Cash Flow
        </td>
        <td
          className={`px-5 py-4 font-black ${
            netCashFlow >= 0 ? "text-green-700" : "text-red-600"
          }`}
        >
          ₹{netCashFlow}
        </td>
      </tr>

      <tr>
        <td className="px-5 py-4 font-black" colSpan="5">
          Closing Balance
        </td>
        <td
          className={`px-5 py-4 font-black ${
            closingBalance >= 0 ? "text-green-700" : "text-red-600"
          }`}
        >
          ₹{closingBalance}
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

function CashFlowSection({ title, data, total }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="border-b border-[var(--border)] p-5">
        <h2 className="text-xl font-black">{title}</h2>
      </div>

      {data.map((item) => (
        <div
          key={item.id}
          className="flex justify-between border-b border-[var(--border)] px-5 py-4 last:border-b-0"
        >
          <div>
            <span className="font-bold">{item.description}</span>
            <p className="text-xs text-[var(--muted)]">{item.account}</p>
          </div>

          <span
            className={`font-bold ${
              item.type === "Inflow" ? "text-green-700" : "text-red-600"
            }`}
          >
            {item.type === "Inflow" ? "+" : "-"}₹{item.amount}
          </span>
        </div>
      ))}

      {data.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-[var(--muted)]">
          No records
        </div>
      )}

      <div className="flex justify-between bg-[var(--surface-soft)] px-5 py-4 font-black">
        <span>Total</span>
        <span className={total >= 0 ? "text-green-700" : "text-red-600"}>
          ₹{total}
        </span>
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

function TypeBadge({ type }) {
  const styles = {
    Inflow: "bg-green-100 text-green-700",
    Outflow: "bg-red-100 text-red-700",
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
function MobileInfo({ label, value, strong }) { return ( <div className="rounded-xl bg-[var(--surface-soft)] p-3"> <p className="text-xs font-bold uppercase text-[var(--muted)]"> {label} </p> <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}> {value || "-"} </p> </div> ); }