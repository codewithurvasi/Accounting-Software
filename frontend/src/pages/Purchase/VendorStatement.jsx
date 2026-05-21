import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Download, Printer, RotateCcw, Search } from "lucide-react";



export default function VendorStatement() {

  const bills = useSelector((state) => state.bills?.bills || []);
const paymentsMade = useSelector(
  (state) => state.paymentsMade?.paymentsMade || []
);
const vendorsData = useSelector((state) => state.vendors?.vendors || []);

  const vendors = [
  "All Vendors",
  ...vendorsData.map((vendor) => vendor.name),
];

const calculateBillTotal = (items = []) => {
  return items.reduce((sum, item) => {
    const amount = Number(item.qty || 0) * Number(item.rate || 0);
    const gstAmount = (amount * Number(item.gst || 0)) / 100;
    return sum + amount + gstAmount;
  }, 0);
};

const ledgerEntries = useMemo(() => {
  const billEntries = bills.map((bill) => ({
    id: `BILL-${bill.id}`,
    date: bill.billDate,
    vendor: bill.vendor,
    type: "Purchase Bill",
    particular: `Bill ${bill.billNo}`,
    debit: 0,
    credit: calculateBillTotal(bill.items),
  }));

  const paymentEntries = paymentsMade
    .filter((payment) => payment.status === "Paid" || payment.status === "Partial")
    .map((payment) => ({
      id: `PAY-${payment.id}`,
      date: payment.date,
      vendor: payment.vendor,
      type: "Payment Made",
      particular: `Payment ${payment.paymentNo} against ${payment.billNo}`,
      debit: Number(payment.amount || 0),
      credit: 0,
    }));

  const openingEntries = vendorsData
    .filter((vendor) => Number(vendor.openingPayable || 0) > 0)
    .map((vendor) => ({
      id: `OPEN-${vendor.id}`,
      date: "2026-05-01",
      vendor: vendor.name,
      type: "Opening Balance",
      particular: "Opening Payable",
      debit: 0,
      credit: Number(vendor.openingPayable || 0),
    }));

  return [...openingEntries, ...billEntries, ...paymentEntries];
}, [bills, paymentsMade, vendorsData]);

 const [vendor, setVendor] = useState("All Vendors");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("2026-05-01");
  const [toDate, setToDate] = useState("2026-05-31");

  const [appliedFilters, setAppliedFilters] = useState({
    vendor: "All Vendors",
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

  const generateStatement = () => {
    if (!fromDate || !toDate) {
      alert("Please select Start Date and End Date");
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      alert("End Date cannot be before Start Date");
      return;
    }

    setAppliedFilters({
      vendor,
      search,
      fromDate,
      toDate,
    });
  };

  const filteredEntries = useMemo(() => {
    return ledgerEntries
      .filter((entry) => {
        const matchesVendor =
          appliedFilters.vendor === "All Vendors" ||
          entry.vendor === appliedFilters.vendor;

        const text = `${entry.vendor} ${entry.type} ${entry.particular}`.toLowerCase();
        const matchesSearch = text.includes(appliedFilters.search.toLowerCase());

        const entryDate = new Date(entry.date);
        const matchesFrom = appliedFilters.fromDate
          ? entryDate >= new Date(appliedFilters.fromDate)
          : true;

        const matchesTo = appliedFilters.toDate
          ? entryDate <= new Date(appliedFilters.toDate)
          : true;

        return matchesVendor && matchesSearch && matchesFrom && matchesTo;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [appliedFilters]);

  let runningBalance = 0;

  const statementRows = filteredEntries.map((entry) => {
    runningBalance += Number(entry.credit || 0) - Number(entry.debit || 0);

    return {
      ...entry,
      balance: runningBalance,
    };
  });

  const totalPurchases = filteredEntries
    .filter((entry) => entry.type === "Purchase Bill")
    .reduce((sum, entry) => sum + Number(entry.credit || 0), 0);

  const totalPayments = filteredEntries
    .filter((entry) => entry.type === "Payment Made")
    .reduce((sum, entry) => sum + Number(entry.debit || 0), 0);

  const totalReturns = filteredEntries
    .filter((entry) => entry.type === "Purchase Return")
    .reduce((sum, entry) => sum + Number(entry.debit || 0), 0);

  const closingBalance = statementRows.length
    ? statementRows[statementRows.length - 1].balance
    : 0;

  const resetFilters = () => {
   setVendor("All Vendors");
    setSearch("");
    setFromDate("2026-05-01");
    setToDate("2026-05-31");

    setAppliedFilters({
     vendor: "All Vendors",
      search: "",
      fromDate: "2026-05-01",
      toDate: "2026-05-31",
    });
  };

  const exportCSV = () => {
    const headers = [
      "Date",
      "Vendor",
      "Type",
      "Particular",
      "Debit",
      "Credit",
      "Balance",
    ];

    const rows = statementRows.map((row) => [
      row.date,
      row.vendor,
      row.type,
      row.particular,
      row.debit,
      row.credit,
      row.balance,
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
    link.download = "vendor-statement.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printStatement = () => {
    const printContent = document.getElementById("print-vendor-statement").innerHTML;
    const printWindow = window.open("", "", "width=1000,height=700");

    printWindow.document.write(`
      <html>
        <head>
          <title>Vendor Statement</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #111827;
            }

            h1, h2, h3 {
              margin: 0;
            }

            .print-header {
              margin-bottom: 24px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 16px;
              display: block !important;
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

            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 999px;
              background: #f3f4f6;
              font-size: 12px;
              font-weight: 700;
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
        <h1 className="text-3xl font-black">Vendor Statement</h1>
        <p className="mt-2 text-slate-300">
          View vendor-wise purchases, payments, purchase returns and payable balance.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black">Statement Filters</h2>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold"
          >
            <RotateCcw size={16} />
            Reset Filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <div>
            <label className="mb-1 block text-sm font-bold">Vendor</label>
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              {vendors.map((item) => (
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
                placeholder="Search statement..."
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

          <div className="flex items-end">
            <button
              onClick={generateStatement}
              className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
            >
              Generate Statement
            </button>
          </div>
        </div>
      </div>

      <div id="print-vendor-statement">
        <div className="print-header hidden">
          <h1>Vendor Statement</h1>
          <p>
            Vendor: {appliedFilters.vendor} | Period: {appliedFilters.fromDate} to{" "}
            {appliedFilters.toDate}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-4 summary">
          <StatCard title="Total Purchases" value={`₹${totalPurchases}`} />
          <StatCard title="Payments Made" value={`₹${totalPayments}`} />
          <StatCard title="Purchase Returns" value={`₹${totalReturns}`} />
          <StatCard title="Closing Payable" value={`₹${closingBalance}`} />
        </div>

       {/* Mobile Cards */}
<div className="mt-6 grid gap-4 md:hidden">
  {statementRows.map((item) => (
    <div
      key={item.id}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--text)]">
            {item.particular}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {item.vendor}
          </p>
        </div>

        <TypeBadge type={item.type} />
      </div>

      <div className="grid gap-2 text-sm">
        <MobileInfo label="Date" value={item.date} />
        <MobileInfo label="Debit" value={item.debit ? `₹${item.debit}` : "-"} />
        <MobileInfo label="Credit" value={item.credit ? `₹${item.credit}` : "-"} />
        <MobileInfo label="Balance" value={`₹${item.balance}`} />
      </div>
    </div>
  ))}

  {statementRows.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
      No statement entries found
    </div>
  )}
</div>

{/* Desktop Table */}
<div className="mt-6 hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[950px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Date</Th>
        <Th>Vendor</Th>
        <Th>Type</Th>
        <Th>Particular</Th>
        <Th>Debit</Th>
        <Th>Credit</Th>
        <Th>Balance</Th>
      </tr>
    </thead>

    <tbody>
      {statementRows.map((item) => (
        <tr
          key={item.id}
          className="border-b border-[var(--border)] last:border-b-0"
        >
          <Td>{item.date}</Td>
          <Td>{item.vendor}</Td>
          <Td>
            <TypeBadge type={item.type} />
          </Td>
          <Td bold>{item.particular}</Td>
          <Td>{item.debit ? `₹${item.debit}` : "-"}</Td>
          <Td>{item.credit ? `₹${item.credit}` : "-"}</Td>
          <Td bold>₹{item.balance}</Td>
        </tr>
      ))}

      {statementRows.length === 0 && (
        <tr>
          <td
            colSpan="7"
            className="px-5 py-10 text-center text-[var(--muted)]"
          >
            No statement entries found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Statement Actions</h2>

        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-2 font-bold text-white"
          >
            <Download size={17} />
            Export CSV
          </button>

          {/* <button
            onClick={printStatement}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 font-bold text-white"
          >
            <Printer size={17} />
            Print Statement
          </button> */}
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

function TypeBadge({ type }) {
  return (
    <span className="badge rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
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