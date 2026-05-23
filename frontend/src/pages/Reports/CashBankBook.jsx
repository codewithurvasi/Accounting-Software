import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Download, RotateCcw, Search, Wallet } from "lucide-react";
import {
  getInvoiceNo,
  getInvoiceDate,
  getInvoiceTotal,
  getPaidAmount,
  getCustomerName,
  getBillTotal,
} from "../../utils/reportHelpers";

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function CashBankBook() {
  const expenses = useSelector((state) => state.expenses?.expenses || []);
  const payments = useSelector((state) => state.payments?.payments || []);
  const invoices = useSelector((state) => state.invoices?.invoices || []);
  const bills = useSelector((state) => state.bills?.bills || []);

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-05-31");
  const [openingBalance, setOpeningBalance] = useState(0);

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    modeFilter: "All",
    fromDate: "2026-05-01",
    toDate: "2026-05-31",
    openingBalance: 0,
  });

  const normalizeMode = (mode = "") => {
    const value = String(mode).toLowerCase();

    if (value.includes("cash")) return "Cash";
    if (value.includes("upi")) return "UPI";
    if (value.includes("card")) return "Card";
    return "Bank";
  };

  const allTransactions = useMemo(() => {
    const rows = [];

    expenses
      .filter((exp) => exp.status === "Paid")
      .forEach((exp) => {
        rows.push({
          id: `expense-${exp.id}`,
          date: exp.date || exp.expenseDate,
          particular: exp.category || "Expense",
          party: exp.paidTo || "-",
          type: "Payment",
          source: "Expense",
          mode: normalizeMode(exp.mode),
          receipt: 0,
          payment: Number(exp.totalAmount || 0),
          reference: exp.referenceNo || exp.expenseNo || "-",
        });
      });

    payments.forEach((pay) => {
      rows.push({
        id: `payment-${pay.id}`,
        date: pay.date || pay.paymentDate,
        particular: "Customer Payment",
        party: pay.customer || pay.customerName || "-",
        type: "Receipt",
        source: "Payment Received",
        mode: normalizeMode(pay.mode || pay.paymentMode),
        receipt: Number(pay.amount || pay.receivedAmount || 0),
        payment: 0,
        reference: pay.referenceNo || pay.paymentNo || "-",
      });
    });

    invoices
      .filter((inv) => Number(getPaidAmount(inv) || inv.paidAmount || 0) > 0)
      .forEach((inv) => {
        rows.push({
          id: `invoice-paid-${inv.id || inv.invoiceNo}`,
          date: inv.paymentDate || getInvoiceDate(inv),
          particular: `Invoice Receipt - ${getInvoiceNo(inv)}`,
          party: getCustomerName(inv),
          type: "Receipt",
          source: "Sales Invoice",
          mode: normalizeMode(inv.paymentMode || inv.mode || "Bank"),
          receipt: Number(getPaidAmount(inv) || inv.paidAmount || 0),
          payment: 0,
          reference: getInvoiceNo(inv),
        });
      });

    bills
      .filter((bill) => bill.status === "Paid" || Number(bill.paidAmount || 0) > 0)
      .forEach((bill) => {
        rows.push({
          id: `bill-paid-${bill.id || bill.billNo}`,
          date: bill.paymentDate || bill.billDate || bill.date,
          particular: `Vendor Payment - ${bill.billNo || bill.vendorBillNo || "-"}`,
          party: bill.vendor || bill.vendorName || "-",
          type: "Payment",
          source: "Purchase Bill",
          mode: normalizeMode(bill.paymentMode || bill.mode || "Bank"),
          receipt: 0,
          payment: Number(bill.paidAmount || getBillTotal(bill) || 0),
          reference: bill.referenceNo || bill.billNo || "-",
        });
      });

    return rows
      .filter((row) => row.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [expenses, payments, invoices, bills]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((item) => {
      const text = `${item.particular} ${item.party} ${item.source} ${item.reference}`.toLowerCase();

      const matchesSearch = text.includes(appliedFilters.search.toLowerCase());

      const matchesMode =
        appliedFilters.modeFilter === "All" ||
        item.mode === appliedFilters.modeFilter;

      const itemDate = new Date(item.date);

      const matchesFrom = appliedFilters.fromDate
        ? itemDate >= new Date(appliedFilters.fromDate)
        : true;

      const matchesTo = appliedFilters.toDate
        ? itemDate <= new Date(appliedFilters.toDate)
        : true;

      return matchesSearch && matchesMode && matchesFrom && matchesTo;
    });
  }, [allTransactions, appliedFilters]);

  let runningBalance = Number(appliedFilters.openingBalance || 0);

  const rowsWithBalance = filteredTransactions.map((item) => {
    runningBalance =
      runningBalance + Number(item.receipt || 0) - Number(item.payment || 0);

    return {
      ...item,
      balance: runningBalance,
    };
  });

  const totalReceipt = filteredTransactions.reduce(
    (sum, item) => sum + Number(item.receipt || 0),
    0
  );

  const totalPayment = filteredTransactions.reduce(
    (sum, item) => sum + Number(item.payment || 0),
    0
  );

  const closingBalance =
    Number(appliedFilters.openingBalance || 0) + totalReceipt - totalPayment;

  const generateReport = () => {
    if (new Date(toDate) < new Date(fromDate)) {
      alert("End Date cannot be before Start Date");
      return;
    }

    setAppliedFilters({
      search,
      modeFilter,
      fromDate,
      toDate,
      openingBalance: Number(openingBalance || 0),
    });
  };

  const resetFilters = () => {
    setSearch("");
    setModeFilter("All");
    setFromDate("2026-05-01");
    setToDate("2026-05-31");
    setOpeningBalance(0);

    setAppliedFilters({
      search: "",
      modeFilter: "All",
      fromDate: "2026-05-01",
      toDate: "2026-05-31",
      openingBalance: 0,
    });
  };

  const exportCSV = () => {
    const headers = [
      "Date",
      "Particular",
      "Party",
      "Source",
      "Mode",
      "Receipt",
      "Payment",
      "Balance",
      "Reference",
    ];

    const rows = rowsWithBalance.map((item) => [
      item.date,
      item.particular,
      item.party,
      item.source,
      item.mode,
      item.receipt,
      item.payment,
      item.balance,
      item.reference,
    ]);

    rows.push(["", "", "", "", "Opening Balance", "", "", appliedFilters.openingBalance, ""]);
    rows.push(["", "", "", "", "Total Receipt", totalReceipt, "", "", ""]);
    rows.push(["", "", "", "", "Total Payment", "", totalPayment, "", ""]);
    rows.push(["", "", "", "", "Closing Balance", "", "", closingBalance, ""]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "cash-bank-book.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[var(--sidebar)] p-6 text-white">
        <h1 className="flex items-center gap-3 text-3xl font-black">
          <Wallet size={30} />
          Cash & Bank Book
        </h1>
        <p className="mt-2 text-slate-300">
          Track receipts, payments and running cash/bank balance.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
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

        <div className="grid gap-4 md:grid-cols-6">
          <div className="flex items-end md:col-span-2">
            <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
              <Search size={18} className="text-[var(--muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="w-full bg-transparent py-3 outline-none"
              />
            </div>
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

          <Input
            label="Opening Balance"
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
          />

          <div>
            <label className="mb-1 block text-sm font-bold">Mode</label>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              <option value="All">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={generateReport}
            className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white"
          >
            Generate Report
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard title="Opening Balance" value={money(appliedFilters.openingBalance)} />
        <StatCard title="Total Receipts" value={money(totalReceipt)} highlight="profit" />
        <StatCard title="Total Payments" value={money(totalPayment)} highlight="loss" />
        <StatCard
          title="Closing Balance"
          value={money(closingBalance)}
          highlight={closingBalance >= 0 ? "profit" : "loss"}
        />
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
        <table className="w-full min-w-[1100px] text-left">
          <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
            <tr>
              <Th>Date</Th>
              <Th>Particular</Th>
              <Th>Party</Th>
              <Th>Source</Th>
              <Th>Mode</Th>
              <Th>Receipt</Th>
              <Th>Payment</Th>
              <Th>Balance</Th>
              <Th>Reference</Th>
            </tr>
          </thead>

          <tbody>
            {rowsWithBalance.map((item) => (
              <tr
                key={item.id}
                className="border-b border-[var(--border)] last:border-b-0"
              >
                <Td>{item.date}</Td>
                <Td bold>{item.particular}</Td>
                <Td>{item.party}</Td>
                <Td>{item.source}</Td>
                <Td>{item.mode}</Td>
                <Td>
                  {item.receipt ? (
                    <span className="font-black text-green-700">
                      {money(item.receipt)}
                    </span>
                  ) : (
                    "-"
                  )}
                </Td>
                <Td>
                  {item.payment ? (
                    <span className="font-black text-red-600">
                      {money(item.payment)}
                    </span>
                  ) : (
                    "-"
                  )}
                </Td>
                <Td bold>{money(item.balance)}</Td>
                <Td>{item.reference}</Td>
              </tr>
            ))}

            {rowsWithBalance.length === 0 && (
              <tr>
                <td
                  colSpan="9"
                  className="px-5 py-10 text-center text-[var(--muted)]"
                >
                  No cash / bank transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {rowsWithBalance.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-black">{item.particular}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {item.date} • {item.mode}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  item.type === "Receipt"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MobileInfo label="Party" value={item.party} />
              <MobileInfo label="Source" value={item.source} />
              <MobileInfo label="Receipt" value={item.receipt ? money(item.receipt) : "-"} />
              <MobileInfo label="Payment" value={item.payment ? money(item.payment) : "-"} />
              <MobileInfo label="Balance" value={money(item.balance)} strong />
              <MobileInfo label="Reference" value={item.reference} />
            </div>
          </div>
        ))}

        {rowsWithBalance.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)]">
            No cash / bank transactions found
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-2 font-bold text-white"
        >
          <Download size={17} />
          Export CSV
        </button>
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-sm font-bold text-[var(--muted)]">{title}</p>
      <h2 className={`mt-2 text-2xl font-black ${color}`}>{value}</h2>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide">
      {children}
    </th>
  );
}

function Td({ children, bold }) {
  return (
    <td className={`px-5 py-4 text-sm ${bold ? "font-bold" : ""}`}>
      {children}
    </td>
  );
}

function MobileInfo({ label, value, strong }) {
  return (
    <div className="rounded-xl bg-[var(--surface-soft)] p-3">
      <p className="text-xs font-bold uppercase text-[var(--muted)]">{label}</p>
      <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}>
        {value || "-"}
      </p>
    </div>
  );
}