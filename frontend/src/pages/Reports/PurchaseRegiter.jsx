import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Download,
  FileSpreadsheet,
  RotateCcw,
  Search,
  Printer,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  getBillGstAmount,
  getBillTaxableAmount,
  getBillTotal,
} from "../../utils/reportHelpers";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getBillDate = (bill) =>
  bill.billDate || bill.date || bill.invoiceDate || bill.createdAt || "-";

const getBillNo = (bill) =>
  bill.billNo || bill.vendorBillNo || bill.invoiceNo || bill.id || "-";

const getVendorName = (bill) =>
  bill.vendor || bill.vendorName || bill.supplierName || "Vendor";

const getVendorGstin = (bill) =>
  bill.vendorGSTIN || bill.vendorGstin || bill.gstin || "Unregistered";

const getBillStatus = (bill) => {
  const total = getBillTotal(bill);
  const paid = Number(bill.paidAmount || bill.amountPaid || bill.paid || 0);

  if (paid <= 0) return "Unpaid";
  if (paid >= total) return "Paid";
  return "Partial";
};

export default function PurchaseRegister() {
  const bills = useSelector((state) => state.bills?.bills || []);
  const expenses = useSelector((state) => state.expenses?.expenses || []);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("All");

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    fromDate: "",
    toDate: "",
    status: "All",
  });

  const purchaseRows = useMemo(() => {
    const billRows = bills.map((bill) => {
      const gst = Number(getBillGstAmount(bill) || 0);
      const taxable = Number(getBillTaxableAmount(bill) || 0);
      const total = Number(getBillTotal(bill) || 0);

      const gstType =
        bill.gstType ||
        bill.taxType ||
        (Number(bill.igst || 0) > 0 ? "IGST" : "CGST_SGST");

      const igst =
        Number(bill.igst || 0) || gstType === "IGST" ? gst : 0;

      const cgst =
        Number(bill.cgst || 0) || gstType !== "IGST" ? gst / 2 : 0;

      const sgst =
        Number(bill.sgst || 0) || gstType !== "IGST" ? gst / 2 : 0;

      return {
        source: "Bill",
        billNo: getBillNo(bill),
        date: getBillDate(bill),
        vendor: getVendorName(bill),
        gstin: getVendorGstin(bill),
        taxable,
        igst,
        cgst,
        sgst,
        gst,
        total,
        paid: Number(bill.paidAmount || bill.amountPaid || bill.paid || 0),
        due: Math.max(
          total - Number(bill.paidAmount || bill.amountPaid || bill.paid || 0),
          0
        ),
        status: getBillStatus(bill),
        itc: gst > 0 ? "Yes" : "No",
      };
    });

    const expenseRows = expenses
      .filter((expense) => expense.gstApplicable && expense.inputGstEligible)
      .map((expense) => {
        const gst = Number(expense.gst || 0);
        const taxable = Number(expense.amount || 0);
        const total = Number(expense.totalAmount || taxable + gst || 0);
        const isIgst = expense.gstType === "IGST";

        return {
          source: "Expense",
          billNo: expense.invoiceNo || expense.expenseNo || expense.id || "-",
          date: expense.invoiceDate || expense.date || "-",
          vendor: expense.paidTo || expense.vendor || "Expense Vendor",
          gstin: expense.vendorGstin || "Unregistered",
          taxable,
          igst: isIgst ? gst : 0,
          cgst: isIgst ? 0 : gst / 2,
          sgst: isIgst ? 0 : gst / 2,
          gst,
          total,
          paid: total,
          due: 0,
          status: "Paid",
          itc: gst > 0 ? "Yes" : "No",
        };
      });

    return [...billRows, ...expenseRows].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [bills, expenses]);

  const filteredRows = useMemo(() => {
    return purchaseRows.filter((row) => {
      const text = `${row.billNo} ${row.vendor} ${row.gstin} ${row.source}`.toLowerCase();

      const matchesSearch = text.includes(appliedFilters.search.toLowerCase());

      const currentDate = new Date(row.date);

      const matchesFrom = appliedFilters.fromDate
        ? currentDate >= new Date(appliedFilters.fromDate)
        : true;

      const matchesTo = appliedFilters.toDate
        ? currentDate <= new Date(appliedFilters.toDate)
        : true;

      const matchesStatus =
        appliedFilters.status === "All" || row.status === appliedFilters.status;

      return matchesSearch && matchesFrom && matchesTo && matchesStatus;
    });
  }, [purchaseRows, appliedFilters]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        acc.taxable += Number(row.taxable || 0);
        acc.igst += Number(row.igst || 0);
        acc.cgst += Number(row.cgst || 0);
        acc.sgst += Number(row.sgst || 0);
        acc.gst += Number(row.gst || 0);
        acc.total += Number(row.total || 0);
        acc.paid += Number(row.paid || 0);
        acc.due += Number(row.due || 0);
        return acc;
      },
      {
        taxable: 0,
        igst: 0,
        cgst: 0,
        sgst: 0,
        gst: 0,
        total: 0,
        paid: 0,
        due: 0,
      }
    );
  }, [filteredRows]);

  const generateReport = () => {
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      alert("End Date start date se pehle nahi ho sakti.");
      return;
    }

    setAppliedFilters({
      search,
      fromDate,
      toDate,
      status,
    });
  };

  const resetFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setStatus("All");

    setAppliedFilters({
      search: "",
      fromDate: "",
      toDate: "",
      status: "All",
    });
  };

  const exportExcel = () => {
    const data = filteredRows.map((row) => ({
      Source: row.source,
      "Bill No": row.billNo,
      Date: row.date,
      Vendor: row.vendor,
      GSTIN: row.gstin,
      Taxable: row.taxable,
      IGST: row.igst,
      CGST: row.cgst,
      SGST: row.sgst,
      "Total GST": row.gst,
      "Bill Total": row.total,
      Paid: row.paid,
      Due: row.due,
      Status: row.status,
      "ITC Available": row.itc,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, ws, "Purchase Register");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "Purchase-Register.xlsx"
    );
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black sm:text-3xl">
            <FileSpreadsheet size={30} />
            Purchase Register
          </h1>

          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Bills, purchase GST, ITC, paid amount and vendor payable summary.
          </p>
        </div>

        <button
          onClick={exportExcel}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white"
        >
          <Download size={18} />
          Export Excel
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <SummaryCard title="Total Purchase" value={money(summary.total)} />
        <SummaryCard title="Taxable Value" value={money(summary.taxable)} />
        <SummaryCard title="Input GST / ITC" value={money(summary.gst)} />
        <SummaryCard title="Vendor Due" value={money(summary.due)} />
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
                placeholder="Search bill, vendor, GSTIN..."
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

          <div>
            <label className="mb-1 block text-sm font-bold">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black">Purchase Register Details</h2>

          <button
            onClick={printReport}
            className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-2 font-bold text-white"
          >
            <Printer size={17} />
            Print
          </button>
        </div>

        <SimpleTable
          headers={[
            "Source",
            "Bill No",
            "Date",
            "Vendor",
            "GSTIN",
            "Taxable",
            "IGST",
            "CGST",
            "SGST",
            "Total GST",
            "Total",
            "Paid",
            "Due",
            "Status",
            "ITC",
          ]}
          rows={filteredRows.map((row) => [
            row.source,
            row.billNo,
            row.date,
            row.vendor,
            row.gstin,
            money(row.taxable),
            money(row.igst),
            money(row.cgst),
            money(row.sgst),
            money(row.gst),
            money(row.total),
            money(row.paid),
            money(row.due),
            row.status,
            row.itc,
          ])}
        />
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

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-sm font-bold text-[var(--muted)]">{title}</p>
      <h3 className="mt-2 text-2xl font-black">{value}</h3>
    </div>
  );
}

function SimpleTable({ headers, rows }) {
  return (
    <>
      <div className="grid gap-4 md:hidden">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
          >
            <div className="mb-4 rounded-2xl bg-[var(--surface-soft)] p-3">
              <p className="font-black">{row[3] || row[1]}</p>
              <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                {row[1]} • {row[2]}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {headers.map((header, index) => (
                <div
                  key={header}
                  className="rounded-xl bg-[var(--surface-soft)] p-3"
                >
                  <p className="text-xs font-bold uppercase text-[var(--muted)]">
                    {header}
                  </p>
                  <p className="mt-1 break-words text-sm font-bold">
                    {row[index] || "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
            No purchase records found
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] md:block">
        <table className="w-full min-w-[1300px] text-left">
          <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-5 py-4 text-sm font-black uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-[var(--border)] last:border-b-0"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="whitespace-nowrap px-5 py-4 text-sm"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-5 py-10 text-center text-[var(--muted)]"
                >
                  No purchase records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}