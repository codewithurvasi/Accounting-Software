import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

const initialAccounts = [
  {
    id: 1,
    code: "1001",
    name: "Cash Account",
    type: "Asset",
    group: "Cash & Bank",
    balanceType: "Debit",
    openingBalance: 45000,
    status: "Active",
    description: "Cash available in business.",
  },
  {
    id: 2,
    code: "1002",
    name: "Bank Account",
    type: "Asset",
    group: "Cash & Bank",
    balanceType: "Debit",
    openingBalance: 220000,
    status: "Active",
    description: "Main company bank account.",
  },
  {
    id: 3,
    code: "1101",
    name: "Accounts Receivable",
    type: "Asset",
    group: "Current Assets",
    balanceType: "Debit",
    openingBalance: 85000,
    status: "Active",
    description: "Amount receivable from customers.",
  },
  {
    id: 4,
    code: "2001",
    name: "Accounts Payable",
    type: "Liability",
    group: "Current Liabilities",
    balanceType: "Credit",
    openingBalance: 65000,
    status: "Active",
    description: "Amount payable to vendors.",
  },
  {
    id: 5,
    code: "2101",
    name: "GST Payable",
    type: "Liability",
    group: "Tax Liability",
    balanceType: "Credit",
    openingBalance: 12000,
    status: "Active",
    description: "GST collected on sales.",
  },
  {
    id: 6,
    code: "2102",
    name: "GST Input Credit",
    type: "Asset",
    group: "Tax Asset",
    balanceType: "Debit",
    openingBalance: 8000,
    status: "Active",
    description: "GST paid on purchases.",
  },
  {
    id: 7,
    code: "3001",
    name: "Capital Account",
    type: "Equity",
    group: "Owner Equity",
    balanceType: "Credit",
    openingBalance: 500000,
    status: "Active",
    description: "Owner capital invested.",
  },
  {
    id: 8,
    code: "4001",
    name: "Sales Revenue",
    type: "Income",
    group: "Direct Income",
    balanceType: "Credit",
    openingBalance: 340000,
    status: "Active",
    description: "Revenue from sales.",
  },
  {
    id: 9,
    code: "5001",
    name: "Purchase Account",
    type: "Expense",
    group: "Direct Expense",
    balanceType: "Debit",
    openingBalance: 125000,
    status: "Active",
    description: "Cost of purchased goods.",
  },
];

const emptyForm = {
  id: null,
  code: "",
  name: "",
  type: "Asset",
  group: "",
  balanceType: "Debit",
  openingBalance: "",
  status: "Active",
  description: "",
};

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [viewAccount, setViewAccount] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const text = `${account.code} ${account.name} ${account.type} ${account.group}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesType = typeFilter === "All" || account.type === typeFilter;
      const matchesStatus =
        statusFilter === "All" || account.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [accounts, search, typeFilter, statusFilter]);

  const getTotalByType = (type) =>
    filteredAccounts
      .filter((account) => account.type === type)
      .reduce((sum, account) => sum + Number(account.openingBalance || 0), 0);

  const resetForm = () => {
    setForm(emptyForm);
    setEditMode(false);
    setShowModal(false);
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedForm = {
      ...form,
      [name]: value,
    };

    if (name === "type") {
      updatedForm.balanceType =
        value === "Asset" || value === "Expense" ? "Debit" : "Credit";
    }

    setForm(updatedForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      id: editMode ? form.id : Date.now(),
      openingBalance: Number(form.openingBalance || 0),
    };

    if (editMode) {
      setAccounts((prev) =>
        prev.map((account) => (account.id === payload.id ? payload : account))
      );
    } else {
      setAccounts((prev) => [payload, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (account) => {
    setForm(account);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Are you sure you want to delete this account?");
    if (!ok) return;

    setAccounts((prev) => prev.filter((account) => account.id !== id));
  };

  const exportCSV = () => {
    const headers = [
      "Code",
      "Account Name",
      "Type",
      "Group",
      "Balance Type",
      "Opening Balance",
      "Status",
      "Description",
    ];

    const rows = filteredAccounts.map((account) => [
      account.code,
      account.name,
      account.type,
      account.group,
      account.balanceType,
      account.openingBalance,
      account.status,
      account.description,
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
    link.download = "chart-of-accounts.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Chart of Accounts</h1>
          <p className="mt-2 text-slate-300">
            Master list of all accounts used in invoices, bills, payments,
            journals and reports.
          </p>
        </div>

        <button
          onClick={() => {
            setForm(emptyForm);
            setEditMode(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
        >
          <Plus size={18} />
          Add Account
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard title="Assets" value={`₹${getTotalByType("Asset")}`} />
        <StatCard title="Liabilities" value={`₹${getTotalByType("Liability")}`} />
        <StatCard title="Income" value={`₹${getTotalByType("Income")}`} />
        <StatCard title="Expenses" value={`₹${getTotalByType("Expense")}`} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black">Filters</h2>

          <button
            onClick={resetFilters}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
            <Search size={18} className="text-[var(--muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search account..."
              className="w-full bg-transparent py-3 outline-none"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
          >
            <option value="All">All Types</option>
            <option value="Asset">Asset</option>
            <option value="Liability">Liability</option>
            <option value="Equity">Equity</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--sidebar)] px-4 py-3 font-bold text-white"
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </div>

  {/* Mobile Cards */}
<div className="grid gap-4 md:hidden">
  {filteredAccounts.map((account) => (
    <div
      key={account.id}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--text)]">
            {account.code} - {account.name}
          </p>
          <p className="text-sm text-[var(--muted)]">{account.group}</p>
        </div>

        <StatusBadge status={account.status} />
      </div>

    <div className="grid gap-2 text-sm">
  <div className="flex items-center justify-between gap-3">
    <span className="text-[var(--muted)]">Type</span>
    <TypeBadge type={account.type} />
  </div>

  <MobileInfo label="Balance Type" value={account.balanceType} />
  <MobileInfo label="Balance" value={`₹${account.openingBalance}`} />
</div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <IconButton color="blue" onClick={() => setViewAccount(account)}>
          <Eye size={16} />
        </IconButton>

        <IconButton color="yellow" onClick={() => handleEdit(account)}>
          <Pencil size={16} />
        </IconButton>

        <IconButton color="red" onClick={() => handleDelete(account.id)}>
          <Trash2 size={16} />
        </IconButton>
      </div>
    </div>
  ))}

  {filteredAccounts.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
      No accounts found
    </div>
  )}
</div>

{/* Desktop Table */}
<div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[1150px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Code</Th>
        <Th>Account Name</Th>
        <Th>Type</Th>
        <Th>Group</Th>
        <Th>Balance Type</Th>
        <Th>Balance</Th>
        <Th>Status</Th>
        <Th>Actions</Th>
      </tr>
    </thead>

    <tbody>
      {filteredAccounts.map((account) => (
        <tr
          key={account.id}
          className="border-b border-[var(--border)] last:border-b-0"
        >
          <Td bold>{account.code}</Td>
          <Td>{account.name}</Td>
          <Td>
            <TypeBadge type={account.type} />
          </Td>
          <Td>{account.group}</Td>
          <Td>{account.balanceType}</Td>
          <Td bold>₹{account.openingBalance}</Td>
          <Td>
            <StatusBadge status={account.status} />
          </Td>
          <Td>
            <div className="flex items-center gap-2">
              <IconButton color="blue" onClick={() => setViewAccount(account)}>
                <Eye size={16} />
              </IconButton>

              <IconButton color="yellow" onClick={() => handleEdit(account)}>
                <Pencil size={16} />
              </IconButton>

              <IconButton color="red" onClick={() => handleDelete(account.id)}>
                <Trash2 size={16} />
              </IconButton>
            </div>
          </Td>
        </tr>
      ))}

      {filteredAccounts.length === 0 && (
        <tr>
          <td
            colSpan="8"
            className="px-5 py-10 text-center text-[var(--muted)]"
          >
            No accounts found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      {showModal && (
        <AccountModal
          title={editMode ? "Edit Account" : "Add New Account"}
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          editMode={editMode}
        />
      )}

      {viewAccount && (
        <ViewAccountModal
          account={viewAccount}
          onClose={() => setViewAccount(null)}
        />
      )}
    </div>
  );
}

function AccountModal({
  title,
  form,
  handleChange,
  handleSubmit,
  resetForm,
  editMode,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="text-sm text-[var(--muted)]">
              Create account head for posting accounting transactions.
            </p>
          </div>

          <button
            onClick={resetForm}
            className="rounded-xl border border-[var(--border)] p-2"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              label="Account Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
            />

            <Input
              label="Account Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <div>
              <label className="mb-1 block text-sm font-bold">
                Account Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>

            <Input
              label="Account Group"
              name="group"
              value={form.group}
              onChange={handleChange}
              placeholder="Cash & Bank / Sales / Tax"
              required
            />

            <div>
              <label className="mb-1 block text-sm font-bold">
                Balance Type
              </label>
              <select
                name="balanceType"
                value={form.balanceType}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
              >
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </select>
            </div>

            <Input
              label="Opening Balance"
              name="openingBalance"
              type="number"
              value={form.openingBalance}
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Description</label>
            <textarea
              rows="4"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Account description..."
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
              {editMode ? "Update Account" : "Save Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewAccountModal({ account, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Account Details</h2>
            <p className="text-sm text-[var(--muted)]">
              Complete chart of account information.
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
          <Info label="Account Code" value={account.code} />
          <Info label="Account Name" value={account.name} />
          <Info label="Type" value={account.type} />
          <Info label="Group" value={account.group} />
          <Info label="Balance Type" value={account.balanceType} />
          <Info label="Opening Balance" value={`₹${account.openingBalance}`} />
          <Info label="Status" value={account.status} />
        </div>

        {account.description && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <h3 className="font-black">Description</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {account.description}
            </p>
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
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        placeholder={placeholder || label}
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

function TypeBadge({ type }) {
  const styles = {
    Asset: "bg-blue-100 text-blue-700",
    Liability: "bg-red-100 text-red-700",
    Equity: "bg-purple-100 text-purple-700",
    Income: "bg-green-100 text-green-700",
    Expense: "bg-yellow-100 text-yellow-700",
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

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || styles.Active
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