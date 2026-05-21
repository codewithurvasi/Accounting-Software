import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  X,
  Save,
} from "lucide-react";

const defaultUsers = [
  {
    id: 1,
    fullName: "Admin User",
    email: "admin@webix.com",
    phone: "9876543210",
    role: "Admin",
    department: "Management",
    status: "Active",
    permissions: ["All Access"],
  },
  {
    id: 2,
    fullName: "Account Manager",
    email: "accounts@webix.com",
    phone: "9876500000",
    role: "Accountant",
    department: "Accounts",
    status: "Active",
    permissions: ["Invoices", "Payments", "Reports"],
  },
  {
    id: 3,
    fullName: "Sales Executive",
    email: "sales@webix.com",
    phone: "9876511111",
    role: "Sales",
    department: "Sales",
    status: "Inactive",
    permissions: ["Customers", "Invoices"],
  },
];

const emptyForm = {
  id: null,
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "Viewer",
  department: "",
  status: "Active",
  permissions: [],
};

const permissionOptions = [
  "Dashboard",
  "Customers",
  "Invoices",
  "Payments",
  "Purchase",
  "Inventory",
  "Reports",
  "Settings",
];

export default function UsersRoles() {
  const [users, setUsers] = useState(defaultUsers);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const stored = localStorage.getItem("usersRoles");
    if (stored) setUsers(JSON.parse(stored));
  }, []);

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem("usersRoles", JSON.stringify(updatedUsers));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditMode(false);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handlePermission = (permission) => {
    const exists = form.permissions.includes(permission);

    if (exists) {
      setForm({
        ...form,
        permissions: form.permissions.filter((p) => p !== permission),
      });
    } else {
      setForm({
        ...form,
        permissions: [...form.permissions, permission],
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      id: editMode ? form.id : Date.now(),
    };

    let updatedUsers = [];

    if (editMode) {
      updatedUsers = users.map((user) =>
        user.id === payload.id ? payload : user
      );
    } else {
      updatedUsers = [payload, ...users];
    }

    saveUsers(updatedUsers);
    resetForm();
  };

  const handleEdit = (user) => {
    setForm(user);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    const updatedUsers = users.filter((user) => user.id !== id);
    saveUsers(updatedUsers);
  };

  const toggleStatus = (id) => {
    const updatedUsers = users.map((user) =>
      user.id === id
        ? {
            ...user,
            status: user.status === "Active" ? "Inactive" : "Active",
          }
        : user
    );

    saveUsers(updatedUsers);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
  );

  const activeUsers = users.filter((u) => u.status === "Active").length;
  const inactiveUsers = users.filter((u) => u.status === "Inactive").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[var(--sidebar)] p-6 text-white">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black">
            <ShieldCheck size={30} />
            Users & Roles
          </h1>

          <p className="mt-2 text-slate-300">
            Manage system users, roles and module access permissions.
          </p>
        </div>

        <button
          onClick={() => {
            setForm(emptyForm);
            setEditMode(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={<Users size={22} />}
        />

        <StatCard
          title="Active Users"
          value={activeUsers}
          icon={<UserCheck size={22} />}
        />

        <StatCard
          title="Inactive Users"
          value={inactiveUsers}
          icon={<UserX size={22} />}
        />

        <StatCard
          title="Roles"
          value="4"
          icon={<ShieldCheck size={22} />}
        />
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
        <Search size={18} className="text-[var(--muted)]" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-transparent outline-none"
        />
      </div>

     {/* Mobile Cards */}
<div className="grid gap-4 md:hidden">
  {filteredUsers.map((user) => (
    <div
      key={user.id}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-[var(--text)]">{user.fullName}</p>
          <p className="mt-1 text-sm font-medium text-[var(--muted)]">
            {user.email}
          </p>
        </div>

        <button
          onClick={() => toggleStatus(user.id)}
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            user.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {user.status}
        </button>
      </div>

      <div className="mb-4 rounded-2xl bg-[var(--surface-soft)] p-3">
        <p className="text-xs font-bold uppercase text-[var(--muted)]">Role</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
            {user.role}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {user.department}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <MobileInfo label="Phone" value={user.phone} />
        <MobileInfo label="Department" value={user.department} />
      </div>

      <div className="mt-4 rounded-2xl bg-[var(--surface-soft)] p-3">
        <p className="text-xs font-bold uppercase text-[var(--muted)]">
          Permissions
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {user.permissions.map((permission) => (
            <span
              key={permission}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
            >
              {permission}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleEdit(user)}
          className="rounded-lg bg-yellow-100 p-2 text-yellow-700"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => handleDelete(user.id)}
          className="rounded-lg bg-red-100 p-2 text-red-700"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  ))}
</div>

{/* Desktop Table */}
<div className="hidden overflow-x-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm md:block">
  <table className="w-full min-w-[1200px] text-left">
    <thead className="bg-[var(--surface-soft)] text-[var(--muted)]">
      <tr>
        <Th>User</Th>
        <Th>Email</Th>
        <Th>Phone</Th>
        <Th>Role</Th>
        <Th>Department</Th>
        <Th>Permissions</Th>
        <Th>Status</Th>
        <Th>Actions</Th>
      </tr>
    </thead>

    <tbody>
      {filteredUsers.map((user) => (
        <tr
          key={user.id}
          className="border-b border-[var(--border)] last:border-b-0"
        >
          <Td bold>{user.fullName}</Td>
          <Td>{user.email}</Td>
          <Td>{user.phone}</Td>

          <Td>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              {user.role}
            </span>
          </Td>

          <Td>{user.department}</Td>

          <Td>
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((permission) => (
                <span
                  key={permission}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                >
                  {permission}
                </span>
              ))}
            </div>
          </Td>

          <Td>
            <button
              onClick={() => toggleStatus(user.id)}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                user.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.status}
            </button>
          </Td>

          <Td>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(user)}
                className="rounded-lg bg-yellow-100 p-2 text-yellow-700"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => handleDelete(user.id)}
                className="rounded-lg bg-red-100 p-2 text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

     

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[var(--surface)] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">
                  {editMode ? "Update User" : "Add New User"}
                </h2>

                <p className="text-sm text-[var(--muted)]">
                  Configure user details and access permissions.
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
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editMode}
                />

                <Select
                  label="Role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  options={["Admin", "Accountant", "Sales", "Viewer"]}
                />

                <Input
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                />

                <Select
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={["Active", "Inactive"]}
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold">
                  Module Permissions
                </label>

                <div className="grid gap-3 md:grid-cols-4">
                  {permissionOptions.map((permission) => (
                    <button
                      key={permission}
                      type="button"
                      onClick={() => handlePermission(permission)}
                      className={`rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                        form.permissions.includes(permission)
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--border)] bg-[var(--surface-soft)]"
                      }`}
                    >
                      {permission}
                    </button>
                  ))}
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
                  className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-black text-white"
                >
                  <Save size={18} />
                  {editMode ? "Update User" : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[var(--muted)]">{title}</p>
        <div className="text-[var(--primary)]">{icon}</div>
      </div>

      <h2 className="mt-3 text-3xl font-black">{value}</h2>
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
        type={type}
        value={value}
        required={required}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold">{label}</label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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
  return (
    <td className={`px-5 py-4 ${bold ? "font-bold" : ""}`}>
      {children}
    </td>
  );
}
function MobileInfo({ label, value, strong }) { return ( <div className="rounded-xl bg-[var(--surface-soft)] p-3"> <p className="text-xs font-bold uppercase text-[var(--muted)]"> {label} </p> <p className={`mt-1 text-sm ${strong ? "font-black" : "font-bold"}`}> {value || "-"} </p> </div> ); }