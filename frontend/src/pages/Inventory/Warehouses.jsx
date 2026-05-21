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

const emptyForm = {
  id: null,
  name: "",
  code: "",
  manager: "",
  phone: "",
  email: "",
  location: "",
  address: "",
  capacity: "",
  usedCapacity: "",
  status: "Active",
  notes: "",
};

const initialWarehouses = [
  {
    id: 1,
    name: "Main Warehouse",
    code: "WH-001",
    manager: "Rahul Sharma",
    phone: "9876543210",
    email: "mainwarehouse@example.com",
    location: "Delhi",
    address: "Sector 12, Industrial Area, Delhi",
    capacity: 1200,
    usedCapacity: 820,
    status: "Active",
    
  },
  {
    id: 2,
    name: "Retail Storage",
    code: "WH-002",
    manager: "Amit Verma",
    phone: "9876512345",
    email: "retailstorage@example.com",
    location: "Mumbai",
    address: "Andheri East, Mumbai",
    capacity: 600,
    usedCapacity: 350,
    status: "Active",
    notes: "Retail stock storage.",
  },
];

export default function Warehouses() {
 const [warehouses, setWarehouses] = useState(() => {
  const saved = localStorage.getItem("warehouses");

  if (saved) {
    return JSON.parse(saved);
  }

  return initialWarehouses;
});

useEffect(() => {
  localStorage.setItem("warehouses", JSON.stringify(warehouses));
}, [warehouses]);

  const [form, setForm] = useState({
    ...emptyForm,
    code: `WH-${String(initialWarehouses.length + 1).padStart(3, "0")}`,
  });

  const [showModal, setShowModal] = useState(false);
  const [viewWarehouse, setViewWarehouse] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const generateCode = () =>
    `WH-${String(warehouses.length + 1).padStart(3, "0")}`;

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((warehouse) => {
      const text =
        `${warehouse.name} ${warehouse.code} ${warehouse.location} ${warehouse.manager}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || warehouse.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [warehouses, search, statusFilter]);

  const totalWarehouses = filteredWarehouses.length;

  const totalCapacity = filteredWarehouses.reduce(
    (sum, item) => sum + Number(item.capacity || 0),
    0
  );

  const totalUsed = filteredWarehouses.reduce(
    (sum, item) => sum + Number(item.usedCapacity || 0),
    0
  );

  const availableSpace = totalCapacity - totalUsed;

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  const resetForm = () => {
    setForm({
      ...emptyForm,
      code: generateCode(),
    });

    setEditMode(false);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      id: editMode ? form.id : Date.now(),
      capacity: Number(form.capacity || 0),
      usedCapacity: Number(form.usedCapacity || 0),
    };

    if (editMode) {
      setWarehouses((prev) =>
        prev.map((item) => (item.id === payload.id ? payload : item))
      );
    } else {
      setWarehouses((prev) => [payload, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (warehouse) => {
    setForm(warehouse);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Are you sure you want to delete this warehouse?");
    if (!ok) return;

    setWarehouses((prev) => prev.filter((item) => item.id !== id));
  };

  const exportCSV = () => {
    const headers = [
      "Warehouse",
      "Code",
      "Manager",
      "Phone",
      "Email",
      "Location",
      "Capacity",
      "Used Capacity",
      "Available",
      "Status",
    ];

    const rows = filteredWarehouses.map((item) => [
      item.name,
      item.code,
      item.manager,
      item.phone,
      item.email,
      item.location,
      item.capacity,
      item.usedCapacity,
      Number(item.capacity || 0) - Number(item.usedCapacity || 0),
      item.status,
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
    link.download = "warehouses.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="text-3xl font-black">Warehouses</h1>

          <p className="mt-2 text-slate-300">
            Manage warehouse locations, capacity and stock storage.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              ...emptyForm,
              code: generateCode(),
            });

            setEditMode(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-black text-white"
        >
          <Plus size={18} />
          Add Warehouse
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard title="Total Warehouses" value={totalWarehouses} />
        <StatCard title="Total Capacity" value={`${totalCapacity} Units`} />
        <StatCard title="Used Capacity" value={`${totalUsed} Units`} />
        <StatCard title="Available Space" value={`${availableSpace} Units`} />
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
              placeholder="Search warehouse..."
              className="w-full bg-transparent py-3 outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div></div>

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
  {filteredWarehouses.map((warehouse) => {
    const available =
      Number(warehouse.capacity || 0) - Number(warehouse.usedCapacity || 0);

    return (
      <div
        key={warehouse.id}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-black text-[var(--text)]">{warehouse.name}</p>
            <p className="mt-1 text-sm font-medium text-[var(--muted)]">
              {warehouse.code}
            </p>
          </div>

          <StatusBadge status={warehouse.status} />
        </div>

        <div className="mb-4 rounded-2xl bg-[var(--surface-soft)] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--muted)]">
                Used
              </p>
              <p className="mt-1 text-lg font-black text-[var(--text)]">
                {warehouse.usedCapacity} Units
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold uppercase text-[var(--muted)]">
                Available
              </p>
              <p className="mt-1 text-lg font-black text-[var(--text)]">
                {available} Units
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <MobileInfo label="Manager" value={warehouse.manager} />
          <MobileInfo label="Location" value={warehouse.location} />
          <MobileInfo label="Capacity" value={`${warehouse.capacity} Units`} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <IconButton color="blue" onClick={() => setViewWarehouse(warehouse)}>
            <Eye size={16} />
          </IconButton>

          <IconButton color="yellow" onClick={() => handleEdit(warehouse)}>
            <Pencil size={16} />
          </IconButton>

          <IconButton color="red" onClick={() => handleDelete(warehouse.id)}>
            <Trash2 size={16} />
          </IconButton>
        </div>
      </div>
    );
  })}

  {filteredWarehouses.length === 0 && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center text-[var(--muted)] shadow-sm">
      No warehouses found
    </div>
  )}
</div>

{/* Desktop Table */}
<div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[1200px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>Warehouse</Th>
        <Th>Code</Th>
        <Th>Manager</Th>
        <Th>Location</Th>
        <Th>Capacity</Th>
        <Th>Used</Th>
        <Th>Available</Th>
        <Th>Status</Th>
        <Th>Actions</Th>
      </tr>
    </thead>

    <tbody>
      {filteredWarehouses.map((warehouse) => {
        const available =
          Number(warehouse.capacity || 0) -
          Number(warehouse.usedCapacity || 0);

        return (
          <tr
            key={warehouse.id}
            className="border-b border-[var(--border)] last:border-b-0"
          >
            <Td bold>{warehouse.name}</Td>
            <Td>{warehouse.code}</Td>
            <Td>{warehouse.manager}</Td>
            <Td>{warehouse.location}</Td>
            <Td>{warehouse.capacity} Units</Td>
            <Td>{warehouse.usedCapacity} Units</Td>
            <Td bold>{available} Units</Td>
            <Td>
              <StatusBadge status={warehouse.status} />
            </Td>
            <Td>
              <div className="flex items-center gap-2">
                <IconButton color="blue" onClick={() => setViewWarehouse(warehouse)}>
                  <Eye size={16} />
                </IconButton>

                <IconButton color="yellow" onClick={() => handleEdit(warehouse)}>
                  <Pencil size={16} />
                </IconButton>

                <IconButton color="red" onClick={() => handleDelete(warehouse.id)}>
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </Td>
          </tr>
        );
      })}

      {filteredWarehouses.length === 0 && (
        <tr>
          <td
            colSpan="9"
            className="px-5 py-10 text-center text-[var(--muted)]"
          >
            No warehouses found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

     

      {showModal && (
        <WarehouseModal
          title={editMode ? "Edit Warehouse" : "Add Warehouse"}
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          editMode={editMode}
        />
      )}

      {viewWarehouse && (
        <ViewWarehouseModal
          warehouse={viewWarehouse}
          onClose={() => setViewWarehouse(null)}
        />
      )}
    </div>
  );
}

function WarehouseModal({
  title,
  form,
  handleChange,
  handleSubmit,
  resetForm,
  editMode,
}) {
  const available =
    Number(form.capacity || 0) - Number(form.usedCapacity || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">{title}</h2>

            <p className="text-sm text-[var(--muted)]">
              Manage warehouse details, capacity and storage information.
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
              label="Warehouse Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Warehouse Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
            />

            <Input
              label="Manager Name"
              name="manager"
              value={form.manager}
              onChange={handleChange}
            />

            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            <Input
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />

            <Input
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
            />

            <Input
              label="Capacity"
              name="capacity"
              type="number"
              value={form.capacity}
              onChange={handleChange}
            />

            <Input
              label="Used Capacity"
              name="usedCapacity"
              type="number"
              value={form.usedCapacity}
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
            <label className="mb-2 block text-sm font-bold">Address</label>

            <textarea
              rows="3"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Warehouse address..."
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Notes</label>

            <textarea
              rows="3"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Warehouse notes..."
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
            />
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <div className="flex items-center justify-between font-black">
              <span>Available Space</span>
              <span>{available} Units</span>
            </div>
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
              {editMode ? "Update Warehouse" : "Save Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewWarehouseModal({ warehouse, onClose }) {
  const available =
    Number(warehouse.capacity || 0) -
    Number(warehouse.usedCapacity || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Warehouse Details</h2>

            <p className="text-sm text-[var(--muted)]">
              Complete warehouse information and capacity details.
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
          <Info label="Warehouse Name" value={warehouse.name} />
          <Info label="Warehouse Code" value={warehouse.code} />
          <Info label="Manager" value={warehouse.manager} />
          <Info label="Phone" value={warehouse.phone} />
          <Info label="Email" value={warehouse.email} />
          <Info label="Location" value={warehouse.location} />
          <Info label="Capacity" value={`${warehouse.capacity} Units`} />
          <Info
            label="Used Capacity"
            value={`${warehouse.usedCapacity} Units`}
          />
          <Info label="Available Space" value={`${available} Units`} />
          <Info label="Status" value={warehouse.status} />
        </div>

        {warehouse.address && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <h3 className="font-black">Address</h3>

            <p className="mt-2 text-sm text-[var(--muted)]">
              {warehouse.address}
            </p>
          </div>
        )}

        {warehouse.notes && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <h3 className="font-black">Notes</h3>

            <p className="mt-2 text-sm text-[var(--muted)]">
              {warehouse.notes}
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
  return (
    <td className={`px-5 py-4 ${bold ? "font-bold" : ""}`}>
      {children}
    </td>
  );
}
function MobileInfo({ label, value, strong }) { return ( <div className="rounded-xl bg-[var(--surface-soft)] p-3"> <p className="text-xs font-bold uppercase text-[var(--muted)]"> {label} </p> <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}> {value || "-"} </p> </div> ); }