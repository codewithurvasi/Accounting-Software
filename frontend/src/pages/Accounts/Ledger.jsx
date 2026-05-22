import { useMemo, useState } from "react";
import {
  getInvoiceGST,
  getInvoiceTaxable,
  getInvoiceTotal,
  getSavedInvoices,
  getSavedPayments,
} from "../../utils/accountingHelpers";
import {
  getBillGstAmount,
  getBillTaxableAmount,
  getBillTotal,
} from "../../utils/reportHelpers";
import { useSelector } from "react-redux";
import { Download, Printer, RotateCcw, Search } from "lucide-react";


export default function Ledger() {

  const bills = useSelector((state) => state.bills?.bills || []);

  const ledgerEntries = useMemo(() => {
  const invoices = getSavedInvoices();
  const payments = getSavedPayments();
  const journalEntries = JSON.parse(
  localStorage.getItem("ledgerpro_journal_entries") || "[]"
);

  const invoiceEntries = invoices.flatMap((invoice) => {
    const total = getInvoiceTotal(invoice);
    const taxable = getInvoiceTaxable(invoice);
    const gst = getInvoiceGST(invoice);

    const invoiceNo = invoice.invoiceNo || invoice.id || "INV";
    const date = invoice.date || invoice.invoiceDate || new Date().toISOString().slice(0, 10);
    const customerName = invoice.customerName || invoice.customer || "Customer";

   const entries = [
  {
    id: `${invoiceNo}-ar`,
    date,
    account: "Accounts Receivable",
    particular: `Sales Invoice - ${customerName}`,
    voucherNo: invoiceNo,
    voucherType: "Invoice",
    debit: total,
    credit: 0,
  },
  {
    id: `${invoiceNo}-sales`,
    date,
    account: "Sales Revenue",
    particular: `Sales Invoice - ${customerName}`,
    voucherNo: invoiceNo,
    voucherType: "Invoice",
    debit: 0,
    credit: taxable,
  },
];

if (gst > 0) {
  entries.push({
    id: `${invoiceNo}-gst`,
    date,
    account: "GST Payable",
    particular: `Output GST - ${customerName}`,
    voucherNo: invoiceNo,
    voucherType: "GST",
    debit: 0,
    credit: gst,
  });
}

return entries;
  });

  const paymentEntries = payments.flatMap((payment) => {
    const amount = Number(payment.amount || payment.receivedAmount || 0);
    const paymentNo = payment.paymentNo || payment.id || "PAY";
    const date = payment.date || payment.paymentDate || new Date().toISOString().slice(0, 10);
    const customerName = payment.customerName || payment.customer || "Customer";
    const mode = payment.paymentMode || payment.mode || "Cash";

    const cashOrBank = mode.toLowerCase().includes("bank")
      ? "Bank Account"
      : "Cash Account";

    return [
      {
        id: `${paymentNo}-cashbank`,
        date,
        account: cashOrBank,
        particular: `Payment Received - ${customerName}`,
        voucherNo: paymentNo,
        voucherType: "Receipt",
        debit: amount,
        credit: 0,
      },
      {
        id: `${paymentNo}-ar`,
        date,
        account: "Accounts Receivable",
        particular: `Payment Received - ${customerName}`,
        voucherNo: paymentNo,
        voucherType: "Receipt",
        debit: 0,
        credit: amount,
      },
    ];
  });

  const purchaseEntries = bills.flatMap((bill) => {
  const total = getBillTotal(bill);
  const taxable = getBillTaxableAmount(bill);
  const gst = getBillGstAmount(bill);

  const billNo = bill.billNo || bill.id || "BILL";
  const date = bill.billDate || bill.date || new Date().toISOString().slice(0, 10);
  const vendorName = bill.vendor || "Vendor";

  const entries = [
    {
      id: `${billNo}-purchase`,
      date,
      account: "Purchase Account",
      particular: `Purchase Bill - ${vendorName}`,
      voucherNo: billNo,
      voucherType: "Bill",
      debit: taxable,
      credit: 0,
    },
    {
      id: `${billNo}-ap`,
      date,
      account: "Accounts Payable",
      particular: `Purchase Bill - ${vendorName}`,
      voucherNo: billNo,
      voucherType: "Bill",
      debit: 0,
      credit: total,
    },
  ];

  if (gst > 0) {
    entries.push({
      id: `${billNo}-gst-input`,
      date,
      account: "GST Input Credit",
      particular: `Input GST - ${vendorName}`,
      voucherNo: billNo,
      voucherType: "GST",
      debit: gst,
      credit: 0,
    });
  }

  return entries;
});

const journalLedgerEntries = journalEntries
  .filter((entry) => entry.status === "Posted")
  .flatMap((entry) =>
    entry.lines.map((line, index) => ({
      id: `journal-${entry.id}-${index}`,
      date: entry.date,
      account: line.account,
      particular: entry.description || "Journal Entry",
      voucherNo: entry.entryNo,
      voucherType: "Journal Entry",
      debit: Number(line.debit || 0),
      credit: Number(line.credit || 0),
    }))
  );

 return [
  ...invoiceEntries,
  ...paymentEntries,
  ...purchaseEntries,
  ...journalLedgerEntries,
];
}, [bills]);

 const accounts = [
  "All Accounts",
  "Cash Account",
  "Bank Account",
  "Capital Account",
"Rent Expense",
"Salary Expense",
  "Sales Revenue",
  "Purchase Account",
  "Accounts Receivable",
  "Accounts Payable",
  "GST Payable",
  "GST Input Credit",
];

  const [account, setAccount] = useState("All Accounts");
  const [search, setSearch] = useState("");
  const [entryType, setEntryType] = useState("all");
  const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

 const [appliedFilters, setAppliedFilters] = useState({
  account: "All Accounts",
  search: "",
  entryType: "all",
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

  const viewLedger = () => {
  if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
    alert("End Date cannot be before Start Date");
    return;
  }

  setAppliedFilters({
    account,
    search,
    entryType,
    fromDate,
    toDate,
  });
};

const handleAccountChange = (value) => {
  setAccount(value);

  setAppliedFilters({
    account: value,
    search,
    entryType,
    fromDate,
    toDate,
  });
};

  const filteredEntries = useMemo(() => {
    return ledgerEntries
      .filter((entry) => {
        const matchesAccount =
  appliedFilters.account === "All Accounts"
    ? true
    : entry.account === appliedFilters.account;

        const text = `${entry.particular} ${entry.voucherNo} ${entry.voucherType}`.toLowerCase();

        const matchesSearch = text.includes(
          appliedFilters.search.toLowerCase()
        );

        const entryDate = new Date(entry.date);

        const matchesFrom = appliedFilters.fromDate
          ? entryDate >= new Date(appliedFilters.fromDate)
          : true;

        const matchesTo = appliedFilters.toDate
          ? entryDate <= new Date(appliedFilters.toDate)
          : true;

        const matchesEntryType =
          appliedFilters.entryType === "all"
            ? true
            : appliedFilters.entryType === "debit"
            ? Number(entry.debit || 0) > 0
            : Number(entry.credit || 0) > 0;

        return (
          matchesAccount &&
          matchesSearch &&
          matchesFrom &&
          matchesTo &&
          matchesEntryType
        );
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [appliedFilters, ledgerEntries]);

  let runningBalance = 0;

  const ledgerRows = filteredEntries.map((entry) => {
    runningBalance += Number(entry.debit || 0) - Number(entry.credit || 0);

    return {
      ...entry,
      balance: runningBalance,
    };
  });

  const totalDebit = filteredEntries.reduce(
    (sum, entry) => sum + Number(entry.debit || 0),
    0
  );

  const totalCredit = filteredEntries.reduce(
    (sum, entry) => sum + Number(entry.credit || 0),
    0
  );

  const closingBalance = ledgerRows.length
    ? ledgerRows[ledgerRows.length - 1].balance
    : 0;

 const resetFilters = () => {
  setAccount("All Accounts");
  setSearch("");
  setEntryType("all");
  setFromDate("");
  setToDate("");

  setAppliedFilters({
   account: "All Accounts",
    search: "",
    entryType: "all",
    fromDate: "",
    toDate: "",
  });
};

  const formatBalance = (value) => {
    if (value > 0) return `₹${value} Dr`;
    if (value < 0) return `₹${Math.abs(value)} Cr`;
    return "₹0";
  };

  const formatMoney = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

  const exportCSV = () => {
    const headers = [
      "Date",
      "Account",
      "Particular",
      "Voucher No",
      "Voucher Type",
      "Debit",
      "Credit",
      "Balance",
    ];

    const rows = ledgerRows.map((row) => [
      row.date,
      row.account,
      row.particular,
      row.voucherNo,
      row.voucherType,
      row.debit,
      row.credit,
      formatBalance(row.balance),
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
    link.download = "ledger.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printLedger = () => {
  const printContent = document.getElementById("print-ledger")?.innerHTML;

  if (!printContent) return;

  const printWindow = window.open("", "", "width=1000,height=700");

  printWindow.document.write(`
    <html>
      <head>
        <title>Ledger</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }

          body {
            font-family: Arial, sans-serif;
            color: #111827;
            margin: 0;
            padding: 0;
          }

          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 16px;
            border-bottom: 1px solid #111827;
            padding-bottom: 10px;
          }

          .summary {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 16px;
          }

          .card {
            border: 1px solid #d1d5db;
            border-radius: 0;
            padding: 10px;
          }

          .card p {
            margin: 0 0 6px 0;
            font-size: 12px;
          }

          .card h2 {
            margin: 0;
            font-size: 18px;
          }

          .md\\:hidden {
            display: none !important;
          }

          .hidden {
            display: block !important;
          }

          .md\\:block {
            display: block !important;
          }

          .overflow-x-auto {
            overflow: visible !important;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }

          th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            font-size: 12px;
          }

          th {
            background: #f3f4f6;
            font-weight: 700;
          }

          button {
            display: none !important;
          }
        </style>
      </head>

      <body>
        ${printContent}
      </body>
    </html>
  `);

  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 500);
};

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <h1 className="text-3xl font-black">Ledger</h1>
        <p className="mt-2 text-slate-300">
          View account-wise debit, credit and running balance history.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black">Ledger Filters</h2>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold"
          >
            <RotateCcw size={16} />
            Reset Filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <div>
            <label className="mb-1 block text-sm font-bold">Account</label>
            <select
              value={account}
             onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              {accounts.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
              <Search size={18} className="text-[var(--muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ledger..."
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
            <label className="mb-1 block text-sm font-bold">Entry Type</label>
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              <option value="all">All Entries</option>
              <option value="debit">Debit Only</option>
              <option value="credit">Credit Only</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={viewLedger}
              className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
            >
              View Ledger
            </button>
          </div>
        </div>
      </div>

      <div id="print-ledger">
        <div className="print-header hidden">
          <h1>Ledger Report</h1>
          <p>
            Account: {appliedFilters.account} | Type:{" "}
            {appliedFilters.entryType === "all"
              ? "All Entries"
              : appliedFilters.entryType === "debit"
              ? "Debit Only"
              : "Credit Only"}{" "}
            | Period: {appliedFilters.fromDate} to {appliedFilters.toDate}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 summary">
          <StatCard title="Total Debit" value={`₹${totalDebit}`} />
          <StatCard title="Total Credit" value={`₹${totalCredit}`} />
          <StatCard
            title="Closing Balance"
            value={formatBalance(closingBalance)}
          />
        </div>

        <div className="mt-6 grid gap-4 md:hidden">
          {ledgerRows.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
            >
              <div className="mb-3">
                <p className="font-semibold text-[var(--text)]">
                  {item.particular}
                </p>
                <p className="text-sm text-[var(--muted)]">{item.voucherNo}</p>
              </div>

              <div className="grid gap-2 text-sm">
                <MobileInfo label="Date" value={item.date} />
                <MobileInfo label="Type" value={item.voucherType} />
                <MobileInfo
                  label="Debit"
                  value={item.debit ? `₹${item.debit}` : "-"}
                />
                <MobileInfo
                  label="Credit"
                  value={item.credit ? `₹${item.credit}` : "-"}
                />
                <MobileInfo
                  label="Balance"
                  value={formatBalance(item.balance)}
                  strong
                />
              </div>
            </div>
          ))}

          {ledgerRows.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
              No ledger entries found
            </div>
          )}
        </div>

        <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
              <tr>
                <Th>Date</Th>
                <Th>Particular</Th>
                <Th>Voucher No</Th>
                <Th>Type</Th>
                <Th>Debit</Th>
                <Th>Credit</Th>
                <Th>Balance</Th>
              </tr>
            </thead>

            <tbody>
              {ledgerRows.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <Td>{item.date}</Td>
                  <Td bold>{item.particular}</Td>
                  <Td>{item.voucherNo}</Td>
                  <Td>{item.voucherType}</Td>
                  <Td>{item.debit ? `₹${item.debit}` : "-"}</Td>
                  <Td>{item.credit ? `₹${item.credit}` : "-"}</Td>
                  <Td bold>{formatBalance(item.balance)}</Td>
                </tr>
              ))}

              {ledgerRows.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-10 text-center text-[var(--muted)]"
                  >
                    No ledger entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Ledger Actions</h2>

        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-2 font-bold text-white"
          >
            <Download size={17} />
            Export CSV
          </button>

          <button
            onClick={printLedger}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 font-bold text-white"
          >
            <Printer size={17} />
            Print Ledger
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

function StatCard({ title, value }) {
  return (
    <div className="card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-sm font-bold text-[var(--muted)]">{title}</p>
      <h2 className="mt-2 text-2xl font-black">{value}</h2>
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