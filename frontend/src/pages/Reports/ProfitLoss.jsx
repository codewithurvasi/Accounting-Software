import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Download, Printer, RotateCcw, Search } from "lucide-react";
import {
  getCustomerName,
  getGstAmount,
  getInvoiceDate,
  getInvoiceNo,
  getInvoiceTotal,
  getPaidAmount,
  getTaxableAmount,
  getBillGstAmount,
  getBillTaxableAmount,
  getBillTotal,
} from "../../utils/reportHelpers";



export default function ProfitLoss() {

  const invoices = useSelector((state) => state.invoices?.invoices || []);
const bills = useSelector((state) => state.bills?.bills || []);
const expensesData = useSelector((state) => state.expenses?.expenses || []);
const salesReturns = useSelector(
  (state) =>
    state.salesReturns?.salesReturns ||
    state.salesReturn?.salesReturns ||
    state.salesReturn?.returns ||
    []
);

const journalEntries = JSON.parse(
  localStorage.getItem("ledgerpro_journal_entries") || "[]"
);

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

  
 const profitLossRows = useMemo(() => {
  const rows = [];

  invoices.forEach((invoice) => {
    const taxable = Number(
      invoice.subtotal ||
        invoice.taxableAmount ||
        getTaxableAmount(invoice) ||
        0
    );

    if (taxable > 0) {
      rows.push({
        id: `sale-${invoice.id || invoice.invoiceNo}`,
        date: getInvoiceDate(invoice),
        category: "Income",
        group: "Direct Income",
        account: "Sales Revenue",
        amount: taxable,
        source: getInvoiceNo(invoice),
      });
    }
  });

  bills.forEach((bill) => {
    const taxable = Number(getBillTaxableAmount(bill) || 0);

    if (taxable > 0) {
      rows.push({
        id: `bill-${bill.id || bill.billNo}`,
        date: bill.billDate || bill.date,
        category: "Expense",
        group: "Direct Expense",
        account: "Purchase Account",
        amount: taxable,
        source: bill.billNo || bill.id,
      });
    }
  });

  expensesData.forEach((expense) => {
    const amount = Number(
      expense.amount ||
        expense.total ||
        expense.expenseAmount ||
        0
    );

    if (amount > 0) {
      rows.push({
        id: `expense-${expense.id}`,
        date: expense.date || expense.expenseDate,
        category: "Expense",
        group: "Indirect Expense",
        account: expense.category || expense.account || "Expense",
        amount,
        source: expense.expenseNo || expense.id,
      });
    }
  });

  salesReturns.forEach((item) => {
  const itemsTaxable = (item.items || []).reduce((sum, row) => {
    const qty = Number(
      row.qty || row.returnQty || row.quantity || 0
    );

    const rate = Number(
      row.rate || row.price || 0
    );

    return sum + qty * rate;
  }, 0);

  const taxable = Number(
    item.taxableAmount ||
      item.subtotal ||
      item.subTotal ||
      item.returnTaxable ||
      itemsTaxable ||
      0
  );

  if (taxable > 0) {
    rows.push({
      id: `sales-return-${item.id}`,
      date: item.date || item.returnDate,

      category: "Expense",

      group: "Direct Expense",

      account: "Sales Return",

      amount: taxable,

      source:
        item.returnNo ||
        item.salesReturnNo ||
        item.id,
    });
  }
});

  journalEntries
    .filter((entry) => entry.status === "Posted")
    .forEach((entry) => {
      entry.lines.forEach((line, index) => {
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);

        const incomeAccounts = ["Sales Revenue", "Service Income"];
        const expenseAccounts = [
          "Purchase Account",
          "Rent Expense",
          "Salary Expense",
          "Bank Charges",
          "Office Expense",
          "Other Expense",
        ];

        if (incomeAccounts.includes(line.account)) {
          const amount = credit - debit;

          if (amount !== 0) {
            rows.push({
              id: `journal-income-${entry.id}-${index}`,
              date: entry.date,
              category: "Income",
              group: "Direct Income",
              account: line.account,
              amount,
              source: entry.entryNo,
            });
          }
        }

        if (expenseAccounts.includes(line.account)) {
          const amount = debit - credit;

          if (amount !== 0) {
            rows.push({
              id: `journal-expense-${entry.id}-${index}`,
              date: entry.date,
              category: "Expense",
              group:
                line.account === "Purchase Account"
                  ? "Direct Expense"
                  : "Indirect Expense",
              account: line.account,
              amount,
              source: entry.entryNo,
            });
          }
        }
      });
    });

  return rows;
}, [
  invoices,
  bills,
  expensesData,
  journalEntries,
  salesReturns,
]);

const filteredData = useMemo(() => {
  return profitLossRows.filter((item) => {
    const text = `${item.account} ${item.group} ${item.category} ${item.source}`.toLowerCase();

    const matchesSearch = text.includes(appliedFilters.search.toLowerCase());

    const itemDate = new Date(item.date);

    const matchesFrom = appliedFilters.fromDate
      ? itemDate >= new Date(appliedFilters.fromDate)
      : true;

    const matchesTo = appliedFilters.toDate
      ? itemDate <= new Date(appliedFilters.toDate)
      : true;

    return matchesSearch && matchesFrom && matchesTo;
  });
}, [appliedFilters, profitLossRows]);

const groupedData = useMemo(() => {
  const map = {};

  filteredData.forEach((item) => {
    const key = `${item.category}-${item.group}-${item.account}`;

    if (!map[key]) {
      map[key] = {
        ...item,
        amount: 0,
      };
    }

    map[key].amount += Number(item.amount || 0);
  });

  return Object.values(map);
}, [filteredData]);

const income = groupedData.filter((item) => item.category === "Income");
const expenses = groupedData.filter((item) => item.category === "Expense");

const totalIncome = income.reduce(
  (sum, item) => sum + Number(item.amount || 0),
  0
);

const totalExpenses = expenses.reduce(
  (sum, item) => sum + Number(item.amount || 0),
  0
);

const directIncome = income
  .filter((item) => item.group === "Direct Income")
  .reduce((sum, item) => sum + Number(item.amount || 0), 0);

const directExpenses = expenses
  .filter((item) => item.group === "Direct Expense")
  .reduce((sum, item) => sum + Number(item.amount || 0), 0);

const grossProfit = directIncome - directExpenses;

const netProfit = totalIncome - totalExpenses;

const profitMargin = totalIncome
  ? ((netProfit / totalIncome) * 100).toFixed(2)
  : 0;

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
    const headers = ["Category", "Group", "Account", "Amount"];

    const rows = groupedData.map((item) => [
      item.category,
      item.group,
      item.account,
      item.amount,
    ]);

    rows.push(["", "", "Total Income", totalIncome]);
    rows.push(["", "", "Total Expenses", totalExpenses]);
    rows.push(["", "", "Net Profit / Loss", netProfit]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "profit-and-loss-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printContent = document.getElementById("profit-loss-print").innerHTML;
    const printWindow = window.open("", "", "width=1200,height=700");

    printWindow.document.write(`
      <html>
        <head>
          <title>Profit & Loss Report</title>
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
        <body>${printContent}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="space-y-6">
     <div className="rounded-2xl border border-slate-200 bg-slate-950 px-5 py-4 text-white shadow-sm">
        <h1 className="text-3xl font-black">Profit & Loss Report</h1>
        <p className="mt-2 text-slate-300">
          Analyze income, expenses, gross profit and net profit/loss.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div id="profit-loss-print">
        <div className="mb-6">
          <h1 className="text-2xl font-black">Profit & Loss Report</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Period: {appliedFilters.fromDate} to {appliedFilters.toDate}
          </p>
        </div>

        <div className="summary grid gap-5 md:grid-cols-4">
          <StatCard title="Total Income" value={`₹${totalIncome}`} />
          <StatCard title="Total Expenses" value={`₹${totalExpenses}`} />
          <StatCard title="Gross Profit" value={`₹${grossProfit}`} />
          <StatCard
            title={netProfit >= 0 ? "Net Profit" : "Net Loss"}
            value={`₹${Math.abs(netProfit)}`}
            highlight={netProfit >= 0 ? "profit" : "loss"}
          />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <StatCard title="Profit Margin" value={`${profitMargin}%`} />
          <StatCard title="Income Accounts" value={income.length} />
          <StatCard title="Expense Accounts" value={expenses.length} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ReportSection title="Income" data={income} total={totalIncome} />

          <ReportSection title="Expenses" data={expenses} total={totalExpenses} />
        </div>
{/* Mobile Cards */}
<div className="mt-6 grid gap-4 md:hidden">
  {groupedData.map((item) => (
    <div
      key={item.id}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="mb-3">
        <p className="font-black text-[var(--text)]">{item.account}</p>
        <p className="mt-1 text-sm font-medium text-[var(--muted)]">
          {item.category} • {item.group}
        </p>
      </div>

      <MobileInfo label="Amount" value={`₹${item.amount}`} strong />
    </div>
  ))}

  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <p className="font-black text-[var(--text)]">Net Profit / Loss</p>
      <p
        className={`font-black ${
          netProfit >= 0 ? "text-green-700" : "text-red-600"
        }`}
      >
        ₹{netProfit}
      </p>
    </div>
  </div>
</div>

{/* Desktop Table */}
<div className="mt-6 hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
  <table className="w-full min-w-[900px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Category</Th>
        <Th>Group</Th>
        <Th>Account</Th>
        <Th>Amount</Th>
      </tr>
    </thead>

    <tbody>
      {groupedData.map((item) => (
        <tr
          key={item.id}
          className="border-b border-[var(--border)] last:border-b-0"
        >
          <Td>{item.category}</Td>
          <Td>{item.group}</Td>
          <Td bold>{item.account}</Td>
          <Td bold>₹{item.amount}</Td>
        </tr>
      ))}
    </tbody>

    <tfoot className="bg-[var(--surface-soft)]">
      <tr>
        <td className="px-5 py-4 font-black" colSpan="3">
          Net Profit / Loss
        </td>
        <td
          className={`px-5 py-4 font-black ${
            netProfit >= 0 ? "text-green-700" : "text-red-600"
          }`}
        >
          ₹{netProfit}
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

          {/* <button
            onClick={printReport}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 font-bold text-white"
          >
            <Printer size={17} />
            Print Report
          </button> */}
        </div>
      </div>


    </div>
  );
}
function ReportSection({ title, data, total }) {
  const isExpense = title === "Expenses";

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`border-b px-4 py-3 ${isExpense ? "bg-red-50" : "bg-emerald-50"}`}>
        <h2 className={`text-sm font-black uppercase tracking-wide ${isExpense ? "text-red-700" : "text-emerald-700"}`}>
          {title}
        </h2>
      </div>

      {data.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-slate-500">
          No records found
        </div>
      ) : (
        data.map((item) => (
          <div
            key={item.id}
            className="flex justify-between border-b border-slate-100 px-4 py-3 text-sm last:border-b-0"
          >
            <div>
              <span className="font-bold text-slate-900">{item.account}</span>
              <p className="text-xs text-slate-500">{item.group}</p>
            </div>

            <span className="font-black text-slate-950">
              ₹{Number(item.amount || 0).toLocaleString("en-IN")}
            </span>
          </div>
        ))
      )}

      <div className="flex justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black">
        <span>Total {title}</span>
        <span>₹{Number(total || 0).toLocaleString("en-IN")}</span>
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
      ? "text-emerald-700"
      : highlight === "loss"
      ? "text-red-600"
      : "text-slate-950";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <h2 className={`mt-2 text-xl font-black ${color}`}>{value}</h2>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide">
      {children}
    </th>
  );
}

function Td({ children, bold }) {
  return (
    <td className={`px-4 py-3 text-sm ${bold ? "font-bold text-slate-950" : "text-slate-700"}`}>
      {children}
    </td>
  );
}
function MobileInfo({ label, value, strong }) { return ( <div className="rounded-xl bg-[var(--surface-soft)] p-3"> <p className="text-xs font-bold uppercase text-[var(--muted)]"> {label} </p> <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}> {value || "-"} </p> </div> ); }