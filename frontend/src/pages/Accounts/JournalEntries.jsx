import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  RotateCcw,
} from "lucide-react";

const accounts = [
  "Cash Account",
  "Bank Account",
  "Capital Account",
  "Sales Revenue",
  "Purchase Account",
  "Rent Expense",
  "Salary Expense",
  "GST Payable",
  "GST Input Credit",
  "Accounts Receivable",
  "Accounts Payable",
];

const initialEntries = [
  {
    id: 1,
    entryNo: "JE-001",
    date: "2026-05-09",
    referenceNo: "REF-001",
    description: "Cash introduced as capital",
    status: "Posted",
    notes: "Owner introduced capital in cash.",
    lines: [
      { account: "Cash Account", debit: 50000, credit: 0 },
      { account: "Capital Account", debit: 0, credit: 50000 },
    ],
  },
  {
    id: 2,
    entryNo: "JE-002",
    date: "2026-05-09",
    referenceNo: "REF-002",
    description: "Rent paid by bank",
    status: "Posted",
    notes: "Monthly rent paid from bank.",
    lines: [
      { account: "Rent Expense", debit: 12000, credit: 0 },
      { account: "Bank Account", debit: 0, credit: 12000 },
    ],
  },
];

const emptyForm = {
  id: null,
  entryNo: "",
  date: new Date().toISOString().split("T")[0],
  referenceNo: "",
  description: "",
  status: "Draft",
  notes: "",
  lines: [
    { account: "", debit: "", credit: "" },
    { account: "", debit: "", credit: "" },
  ],
};

export default function JournalEntries() {
  const STORAGE_KEY = "ledgerpro_journal_entries";

const [entries, setEntries] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : initialEntries;
});

useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}, [entries]);
  const [form, setForm] = useState({
    ...emptyForm,
    entryNo: `JE-${String(initialEntries.length + 1).padStart(3, "0")}`,
  });

  const [showModal, setShowModal] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [entryTypeFilter, setEntryTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const generateEntryNo = () => {
  const maxNo = entries.reduce((max, entry) => {
    const num = Number(String(entry.entryNo || "").replace("JE-", ""));
    return Number.isFinite(num) ? Math.max(max, num) : max;
  }, 0);

  return `JE-${String(maxNo + 1).padStart(3, "0")}`;
};

  const totalDebit = (lines = []) =>
    lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);

  const totalCredit = (lines = []) =>
    lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);

  const isBalanced = totalDebit(form.lines) === totalCredit(form.lines);

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

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const linesText = entry.lines.map((line) => line.account).join(" ");

      const text =
        `${entry.entryNo} ${entry.referenceNo} ${entry.description} ${linesText}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || entry.status === statusFilter;

        const hasDebit = entry.lines.some((line) => Number(line.debit || 0) > 0);
const hasCredit = entry.lines.some((line) => Number(line.credit || 0) > 0);

const matchesEntryType =
  entryTypeFilter === "All" ||
  (entryTypeFilter === "Debit" && hasDebit) ||
  (entryTypeFilter === "Credit" && hasCredit);

      const entryDate = new Date(entry.date);
      const matchesFrom = fromDate ? entryDate >= new Date(fromDate) : true;
      const matchesTo = toDate ? entryDate <= new Date(toDate) : true;

      return (
  matchesSearch &&
  matchesStatus &&
  matchesEntryType &&
  matchesFrom &&
  matchesTo
);
    });
  }, [entries, search, statusFilter, fromDate, toDate]);

  const postedCount = filteredEntries.filter((e) => e.status === "Posted").length;
  const draftCount = filteredEntries.filter((e) => e.status === "Draft").length;
  const totalJournalValue = filteredEntries.reduce(
    (sum, entry) => sum + totalDebit(entry.lines),
    0
  );

  const resetForm = () => {
    setForm({
      ...emptyForm,
      entryNo: generateEntryNo(),
    });

    setEditMode(false);
    setShowModal(false);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
    setEntryTypeFilter("All");
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

const handleLineChange = (index, field, value) => {
  const updatedLines = [...form.lines];

  // Same account duplicate check
  if (field === "account") {
    const alreadyExists = updatedLines.some(
      (line, i) =>
        i !== index &&
        String(line.account).toLowerCase() ===
          String(value).toLowerCase()
    );

    if (alreadyExists) {
      alert("Same account cannot be selected multiple times.");
      return;
    }
  }

  updatedLines[index][field] = value;

  // Debit entered → clear credit
  if (field === "debit" && Number(value) > 0) {
    updatedLines[index].credit = "";
  }

  // Credit entered → clear debit
  if (field === "credit" && Number(value) > 0) {
    updatedLines[index].debit = "";
  }

  setForm({
    ...form,
    lines: updatedLines,
  });
};

  const addLine = () => {
    setForm({
      ...form,
      lines: [...form.lines, { account: "", debit: "", credit: "" }],
    });
  };

  const removeLine = (index) => {
    if (form.lines.length <= 2) return;

    setForm({
      ...form,
      lines: form.lines.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isBalanced) {
      alert("Journal entry is not balanced. Total Debit must equal Total Credit.");
      return;
    }

    if (totalDebit(form.lines) === 0) {
      alert("Amount cannot be zero.");
      return;
    }

    const payload = {
      ...form,
      id: editMode ? form.id : Date.now(),
      lines: form.lines.map((line) => ({
        account: line.account,
        debit: Number(line.debit || 0),
        credit: Number(line.credit || 0),
      })),
    };

    if (editMode) {
      setEntries((prev) =>
        prev.map((entry) => (entry.id === payload.id ? payload : entry))
      );
    } else {
      setEntries((prev) => [payload, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (entry) => {
    setForm(entry);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Are you sure you want to delete this journal entry?");
    if (!ok) return;

    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const exportCSV = () => {
    const headers = [
      "Entry No",
      "Date",
      "Reference No",
      "Description",
      "Status",
      "Account",
      "Debit",
      "Credit",
    ];

    const rows = filteredEntries.flatMap((entry) =>
      entry.lines.map((line) => [
        entry.entryNo,
        entry.date,
        entry.referenceNo,
        entry.description,
        entry.status,
        line.account,
        line.debit,
        line.credit,
      ])
    );

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "journal-entries.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Journal Entries</h1>
          <p className="mt-2 text-slate-300">
            Record manual debit and credit accounting adjustments.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              ...emptyForm,
              entryNo: generateEntryNo(),
            });
            setEditMode(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
        >
          <Plus size={18} />
          Create Entry
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard title="Total Entries" value={filteredEntries.length} />
        <StatCard title="Posted" value={postedCount} />
        <StatCard title="Draft" value={draftCount} />
        <StatCard title="Journal Value" value={`₹${totalJournalValue}`} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black">Filters</h2>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold"
          >
            <RotateCcw size={16} />
            Reset Filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
            <Search size={18} className="text-[var(--muted)]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entry, account..."
              className="w-full bg-transparent py-3 outline-none"
            />
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
              <option value="All">All</option>
              <option value="Draft">Draft</option>
              <option value="Posted">Posted</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black">Journal List</h2>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-2 font-bold text-white"
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>

    {/* Mobile Cards */}
<div className="grid gap-4 md:hidden">
  {filteredEntries.map((entry) => (
    <div
      key={entry.id}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--text)]">
            {entry.entryNo}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {entry.description}
          </p>
        </div>

        <StatusBadge status={entry.status} />
      </div>

      <div className="grid gap-2 text-sm">
        <MobileInfo label="Date" value={entry.date} />
        <MobileInfo label="Total Debit" value={`₹${totalDebit(entry.lines)}`} />
        <MobileInfo label="Total Credit" value={`₹${totalCredit(entry.lines)}`} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <IconButton color="blue" onClick={() => setViewEntry(entry)}>
          <Eye size={16} />
        </IconButton>

        <IconButton color="yellow" onClick={() => handleEdit(entry)}>
          <Pencil size={16} />
        </IconButton>

        <IconButton color="red" onClick={() => handleDelete(entry.id)}>
          <Trash2 size={16} />
        </IconButton>
      </div>
    </div>
  ))}

  {filteredEntries.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
      No journal entries found
    </div>
  )}
</div>

{/* Desktop Table */}
<div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[1150px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Entry No</Th>
        <Th>Date</Th>
        <Th>Description</Th>
        <Th>Total Debit</Th>
        <Th>Total Credit</Th>
        <Th>Status</Th>
        <Th>Actions</Th>
      </tr>
    </thead>

    <tbody>
      {filteredEntries.map((entry) => (
        <tr
          key={entry.id}
          className="border-b border-[var(--border)] last:border-b-0"
        >
          <Td bold>{entry.entryNo}</Td>
          <Td>{entry.date}</Td>
          <Td>{entry.description}</Td>
          <Td bold>₹{totalDebit(entry.lines)}</Td>
          <Td bold>₹{totalCredit(entry.lines)}</Td>
          <Td>
            <StatusBadge status={entry.status} />
          </Td>
          <Td>
            <div className="flex items-center gap-2">
              <IconButton color="blue" onClick={() => setViewEntry(entry)}>
                <Eye size={16} />
              </IconButton>

              <IconButton color="yellow" onClick={() => handleEdit(entry)}>
                <Pencil size={16} />
              </IconButton>

              <IconButton color="red" onClick={() => handleDelete(entry.id)}>
                <Trash2 size={16} />
              </IconButton>
            </div>
          </Td>
        </tr>
      ))}

      {filteredEntries.length === 0 && (
        <tr>
          <td
            colSpan="7"
            className="px-5 py-10 text-center text-[var(--muted)]"
          >
            No journal entries found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
     

      {showModal && (
        <JournalModal
          title={editMode ? "Edit Journal Entry" : "Create Journal Entry"}
          form={form}
          handleChange={handleChange}
          handleLineChange={handleLineChange}
          addLine={addLine}
          removeLine={removeLine}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          totalDebit={totalDebit(form.lines)}
          totalCredit={totalCredit(form.lines)}
          isBalanced={isBalanced}
          editMode={editMode}
        />
      )}

      {viewEntry && (
        <ViewModal
          entry={viewEntry}
          onClose={() => setViewEntry(null)}
          totalDebit={totalDebit(viewEntry.lines)}
          totalCredit={totalCredit(viewEntry.lines)}
        />
      )}
    </div>
  );
}

function JournalModal({
  title,
  form,
  handleChange,
  handleLineChange,
  addLine,
  removeLine,
  handleSubmit,
  resetForm,
  totalDebit,
  totalCredit,
  isBalanced,
  editMode,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-7xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="text-sm text-[var(--muted)]">
              Total debit and credit must be equal before posting.
            </p>
          </div>

          <button
            onClick={resetForm}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              label="Entry No"
              name="entryNo"
              value={form.entryNo}
              onChange={handleChange}
              required
            />

            <Input
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />

            <Input
              label="Reference No"
              name="referenceNo"
              value={form.referenceNo}
              onChange={handleChange}
            />

            <div>
              <label className="mb-1 block text-sm font-bold">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option value="Draft">Draft</option>
                <option value="Posted">Posted</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Journal entry description"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            />
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black">Debit / Credit Lines</h3>

              <button
                type="button"
                onClick={addLine}
                className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white"
              >
                + Add Line
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
              <table className="w-full min-w-[850px]">
                <thead className="bg-[var(--surface-soft)]">
                  <tr>
                    <Th>Account</Th>
                    <Th>Debit</Th>
                    <Th>Credit</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>

                <tbody>
                  {form.lines.map((line, index) => (
                    <tr key={index} className="border-t border-[var(--border)]">
                      <Td>
                        <select
                          value={line.account}
                          onChange={(e) =>
                            handleLineChange(index, "account", e.target.value)
                          }
                          required
                          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                        >
                          <option value="">Select Account</option>
                          {accounts.map((account) => (
                            <option key={account} value={account}>
                              {account}
                            </option>
                          ))}
                        </select>
                      </Td>

                      <Td>
                        <input
                          type="number"
                          min="0"
                          value={line.debit}
                          onChange={(e) =>
                            handleLineChange(index, "debit", e.target.value)
                          }
                          className="w-40 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                        />
                      </Td>

                      <Td>
                        <input
                          type="number"
                          min="0"
                          value={line.credit}
                          onChange={(e) =>
                            handleLineChange(index, "credit", e.target.value)
                          }
                          className="w-40 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
                        />
                      </Td>

                      <Td>
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="rounded-lg bg-red-100 p-2 text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className={`ml-auto max-w-md rounded-2xl border p-5 ${
              isBalanced
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <SummaryRow label="Total Debit" value={`₹${totalDebit}`} />
            <SummaryRow label="Total Credit" value={`₹${totalCredit}`} />
            <div className="mt-3 border-t pt-3 font-black">
              {isBalanced ? "Balanced Entry" : "Debit and Credit not matching"}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Notes</label>
            <textarea
              rows="4"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Journal notes..."
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-[var(--border)] px-5 py-3 font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white"
            >
              {editMode ? "Update Entry" : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewModal({ entry, onClose, totalDebit, totalCredit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Journal Entry Details</h2>
            <p className="text-sm text-[var(--muted)]">
              Complete debit and credit posting details.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Info label="Entry No" value={entry.entryNo} />
          <Info label="Date" value={entry.date} />
          <Info label="Reference No" value={entry.referenceNo} />
          <Info label="Description" value={entry.description} />
          <Info label="Status" value={entry.status} />
          <Info label="Total Debit" value={`₹${totalDebit}`} />
          <Info label="Total Credit" value={`₹${totalCredit}`} />
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[var(--surface-soft)]">
              <tr>
                <Th>Account</Th>
                <Th>Debit</Th>
                <Th>Credit</Th>
              </tr>
            </thead>

            <tbody>
              {entry.lines.map((line, index) => (
                <tr key={index} className="border-t border-[var(--border)]">
                  <Td>{line.account}</Td>
                  <Td>{line.debit ? `₹${line.debit}` : "-"}</Td>
                  <Td>{line.credit ? `₹${line.credit}` : "-"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {entry.notes && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <h3 className="font-black">Notes</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{entry.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  min,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <input
        name={name}
        type={type}
        value={value}
        min={min}
        onChange={onChange}
        required={required}
        placeholder={label}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <p className="text-sm font-bold text-[var(--muted)]">{title}</p>
      <h2 className="mt-2 text-2xl font-black">{value}</h2>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <h3 className="mt-1 font-black">{value || "-"}</h3>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Posted: "bg-green-100 text-green-700",
    Draft: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || styles.Draft
      }`}
    >
      {status}
    </span>
  );
}

function IconButton({ children, onClick, color }) {
  const styles = {
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <button onClick={onClick} className={`rounded-lg p-2 ${styles[color]}`}>
      {children}
    </button>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between font-bold">
      <span>{label}</span>
      <span>{value}</span>
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