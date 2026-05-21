import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Download, Printer, RotateCcw, Search } from "lucide-react";



export default function CustomerStatement() {

  const invoices = useSelector((state) => state.invoices?.invoices || []);

const payments = useSelector((state) => state.payments?.payments || []);

const salesReturns = useSelector(
  (state) =>
    state.salesReturns?.salesReturns ||
    state.salesReturn?.salesReturns ||
    state.salesReturn?.returns ||
    []
);

const customersData = useSelector(
  (state) => state.customers?.customers || []
);

const ledgerEntries = useMemo(() => {
  const openingEntries = customersData.map((customer) => ({
    id: `OB-${customer.id}`,
    date: customer.createdAt || "2026-05-01",
    customer:
      customer.name ||
      customer.customerName ||
      customer.companyName,

    type: "Opening Balance",
    particular: "Opening Balance",

    debit:
      customer.balanceType === "Debit"
        ? Number(customer.openingBalance || 0)
        : 0,

    credit:
      customer.balanceType === "Credit"
        ? Number(customer.openingBalance || 0)
        : 0,
  }));

  const invoiceEntries = invoices.map((invoice) => ({
    id: `INV-${invoice.id}`,
    date: invoice.date || invoice.invoiceDate,

    customer: invoice.customer,

    type: "Invoice",
    particular: `Invoice ${invoice.invoiceNo}`,

    debit: Number(
      invoice.amount ||
      invoice.total ||
      invoice.grandTotal ||
      0
    ),

    credit: 0,
  }));

  const paymentEntries = payments.map((payment) => ({
    id: `PAY-${payment.id}`,
    date: payment.date,

    customer: payment.customer,

    type: "Payment",
    particular: `Payment ${payment.paymentNo}`,

    debit: 0,

    credit: Number(payment.amount || 0),
  }));

  const salesReturnEntries = salesReturns.map((item) => ({
    id: `SR-${item.id}`,
    date: item.date || item.returnDate,

    customer: item.customer,

    type: "Sales Return",

    particular: `Sales Return ${
      item.returnNo || item.salesReturnNo
    }`,

    debit: 0,

    credit: Number(
      item.amount ||
      item.total ||
      item.grandTotal ||
      0
    ),
  }));

  return [
    ...openingEntries,
    ...invoiceEntries,
    ...paymentEntries,
    ...salesReturnEntries,
  ];
}, [customersData, invoices, payments, salesReturns]);

const customers = [
  "All Customers",
  ...new Set([
    ...customersData
      .map((c) => c.name || c.customerName || c.companyName)
      .filter(Boolean),
    ...invoices.map((i) => i.customer).filter(Boolean),
    ...payments.map((p) => p.customer).filter(Boolean),
    ...salesReturns.map((r) => r.customer).filter(Boolean),
  ]),
];

const [customer, setCustomer] = useState("All Customers");
const [search, setSearch] = useState("");
const [fromDate, setFromDate] = useState("2026-05-01");
const [toDate, setToDate] = useState("2026-05-31");

const [appliedFilters, setAppliedFilters] = useState({
  customer: "All Customers",
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

  setAppliedFilters({
    customer,
    search,
    fromDate,
    toDate,
  });
};

 
  const filteredEntries = useMemo(() => {
    return ledgerEntries
      .filter((entry) => {
        const matchesCustomer =
          appliedFilters.customer === "All Customers" ||
          entry.customer === appliedFilters.customer;

        const text = `${entry.customer} ${entry.type} ${entry.particular}`.toLowerCase();
        const matchesSearch = text.includes(appliedFilters.search.toLowerCase());

        const entryDate = new Date(entry.date);
        const matchesFrom = appliedFilters.fromDate
          ? entryDate >= new Date(appliedFilters.fromDate)
          : true;

        const matchesTo = appliedFilters.toDate
          ? entryDate <= new Date(appliedFilters.toDate)
          : true;

        return matchesCustomer && matchesSearch && matchesFrom && matchesTo;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [ledgerEntries, appliedFilters]);

  let runningBalance = 0;

  const statementRows = filteredEntries.map((entry) => {
    runningBalance += Number(entry.debit || 0) - Number(entry.credit || 0);

    return {
      ...entry,
      balance: runningBalance,
    };
  });

  const totalInvoice = filteredEntries
    .filter((entry) => entry.type === "Invoice")
    .reduce((sum, entry) => sum + Number(entry.debit || 0), 0);

  const totalPayments = filteredEntries
    .filter((entry) => entry.type === "Payment")
    .reduce((sum, entry) => sum + Number(entry.credit || 0), 0);

  const totalReturns = filteredEntries
    .filter((entry) => entry.type === "Sales Return")
    .reduce((sum, entry) => sum + Number(entry.credit || 0), 0);

  const outstanding = statementRows.length
    ? statementRows[statementRows.length - 1].balance
    : 0;

  const resetFilters = () => {
    setCustomer("Rahul Traders");
    setSearch("");
    setFromDate("2026-05-01");
    setToDate("2026-05-31");

    setAppliedFilters({
      customer: "Rahul Traders",
      search: "",
      fromDate: "2026-05-01",
      toDate: "2026-05-31",
    });
  };

  const exportCSV = () => {
    const headers = [
      "Date",
      "Customer",
      "Type",
      "Particular",
      "Debit",
      "Credit",
      "Balance",
    ];

    const rows = statementRows.map((row) => [
      row.date,
      row.customer,
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
    link.download = "customer-statement.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printStatement = () => {
    const printContent = document.getElementById("print-statement").innerHTML;

    const printWindow = window.open("", "", "width=1000,height=700");

    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Statement</title>
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
        <h1 className="text-3xl font-black">Customer Statement</h1>
        <p className="mt-2 text-slate-300">
          View customer-wise invoices, payments, returns and outstanding balance.
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
            <label className="mb-1 block text-sm font-bold">Customer</label>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              {customers.map((item) => (
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

      <div id="print-statement">
        <div className="print-header hidden">
          <h1>Customer Statement</h1>
          <p>
            Customer: {appliedFilters.customer} | Period: {appliedFilters.fromDate} to{" "}
            {appliedFilters.toDate}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-4 summary">
          <StatCard title="Total Invoice" value={`₹${totalInvoice}`} />
          <StatCard title="Paid Amount" value={`₹${totalPayments}`} />
          <StatCard title="Sales Returns" value={`₹${totalReturns}`} />
          <StatCard title="Outstanding" value={`₹${outstanding}`} />
        </div>

        {/* MOBILE CARD VIEW */}
<div className="mt-6 grid gap-4 md:hidden">
  {statementRows.map((item) => (
    <div
      key={item.id}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <h3 className="text-lg font-black">{item.particular}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{item.date}</p>
        </div>

        <TypeBadge type={item.type} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MobileInfo label="Customer" value={item.customer} />
        <MobileInfo label="Debit" value={item.debit ? `₹${item.debit}` : "-"} />
        <MobileInfo label="Credit" value={item.credit ? `₹${item.credit}` : "-"} />
        <MobileInfo label="Balance" value={`₹${item.balance}`} strong />
      </div>
    </div>
  ))}

  {statementRows.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-[var(--muted)]">
      No statement entries found
    </div>
  )}
</div>

{/* DESKTOP TABLE VIEW */}
<div className="mt-6 hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[950px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Date</Th>
        <Th>Customer</Th>
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
          <Td>{item.customer}</Td>
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
  return <span className="badge rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{type}</span>;
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